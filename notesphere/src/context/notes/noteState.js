import { useState } from "react";
import NoteContext from "./noteContext";

const NoteState = (props) => {
  const host = "http://localhost:5000";

  const [notes, setNotes] = useState([]);
  const [oneNote, setOneNote] = useState([]);

  // get all notes
  const getNotes = async () => {
    const response = await fetch(`${host}/api/notes/fetchallnotes`, {
      method: "GET",
      headers: {
        "Content-Type": "application/json",
        "auth-token": localStorage.getItem("token"),
      },
    });
    const json = await response.json();
    setNotes(json.notes);
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
      const json = await response.json();
      if (response.ok) {
        setNotes(json.notes);
      } else {
        console.log("Failed to add a note or Invalid json response", json);
      }
    } catch (error) {
      console.error("Error adding notes", error);
    }
  };

  // Delete a note
  const deleteNote = async (id) => {
    try {
      const response = await fetch(`${host}/api/notes/deletenote/${id}`, {
        method: "DELETE",
        headers: {
          "Content-Type": "application/json",
          "auth-token": localStorage.getItem("token"),
        },
      });
      const json = await response.json();
      if (response.ok) {
        const newNote = notes.filter((note) => {
          return note._id !== id;
        });
        setNotes(newNote);
      } else {
        console.log("Failed to delete a note:", json);
      }
    } catch (error) {
      console.log("Error while deleting a note: ", error);
    }
  };

  // Edit a note
  const editNote = async (id, title, description, tag) => {
    // API calls
    const response = await fetch(`${host}/api/notes/updatenote/${id}`, {
      method: "PUT",
      headers: {
        "Content-Type": "application/json",
        "auth-token": localStorage.getItem("token"),
      },
      body: JSON.stringify({ title, description, tag }),
    });
    const json = await response.json();
    console.log(json);

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
      const json = await response.json();
      setOneNote(json.note);
      console.log(json.note);
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
