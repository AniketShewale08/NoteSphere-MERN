import { useState } from "react";
import NoteContext from "./noteContext";

const NoteState = (props) => {
  const host = "http://localhost:5000";

  const [notes, setNotes] = useState([]);
  const [oneNote, setOneNote] = useState([]);

  // get all notes
  const getNotes = async () => {
    try {
      const response = await fetch(`${host}/api/notes/fetchallnotes`, {
        method: "GET",
        headers: {
          "Content-Type": "application/json",
          "auth-token": localStorage.getItem("token"),
        },
      });
      if (!response.ok) {
        throw new Error("Failed to fetch notes");
      }
      const json = await response.json();
      setNotes(json.notes);
    } catch (errors) {
      console.log("Error while fetching notes: ", errors.message);
    }
  };

  // Add a note
  const addNote = async (title, description, tag) => {
    try {
      const response = await fetch(`${host}/api/notes/addnotes`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "auth-token": localStorage.getItem("token"),
        },
        body: JSON.stringify({ title, description, tag }),
      });
      if (!response.ok) {
        throw new Error("Failed to add a note or Invalid json response");
      } 
      const json = await response.json();
      setNotes(json.notes);
    } catch (error) {
      console.error("Error adding notes", error);
    }
  };

  // Delete a note
  const deleteNote = async (id) => {
    const newNote = notes.filter((note) => {
      return note._id !== id;
    });
    setNotes(newNote);

    try {
      const response = await fetch(`${host}/api/notes/deletenote/${id}`, {
        method: "DELETE",
        headers: {
          "Content-Type": "application/json",
          "auth-token": localStorage.getItem("token"),
        },
      });
      // eslint-disable-next-line
      const json = await response.json();
      if (!response.ok) {
        throw new Error("Failed to delete the note");
      }
    } catch (error) {
      console.log("Error while deleting a note: ", error);
      setNotes([...notes]);
    }
  };

  // Edit a note
  const editNote = async (id, title, description, tag) => {
    // API calls
    try {
      const response = await fetch(`${host}/api/notes/updatenote/${id}`, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
          "auth-token": localStorage.getItem("token"),
        },
        body: JSON.stringify({ title, description, tag }),
      });
      // eslint-disable-next-line
      const json = await response.json();

      // Logic to edit notes at client
      let newNotes = JSON.parse(JSON.stringify(notes));
      for (let index = 0; index < newNotes.length; index++) {
        const element = newNotes[index];
        if (element._id === id) {
          newNotes[index].title = title;
          newNotes[index].description = description;
          newNotes[index].tag = tag;
          break;
        }
      }
      setNotes(newNotes);
    } catch (errors) {
      console.log("Error while updating the note", errors.message);
    }
  };

  // get a specific notes
  const getOneNote = async (id) => {
    try {
      const response = await fetch(`${host}/api/notes/getNote/${id}`, {
        method: "GET",
        headers: {
          "Content-Type": "application/json",
          "auth-token": localStorage.getItem("token"),
        },
      });

      if (!response.ok) {
        throw new Error("Failed to get a note");
      }
      const json = await response.json();
      setOneNote(json.note);
    } catch (errors) {
      console.log("Error while getting a specific note", errors);
    }
  };

  return (
    <NoteContext.Provider
      value={{
        notes,
        oneNote,
        setNotes,
        addNote,
        deleteNote,
        editNote,
        getNotes,
        getOneNote,
        setOneNote,
      }}
    >
      {props.children}
    </NoteContext.Provider>
  );
};

export default NoteState;
