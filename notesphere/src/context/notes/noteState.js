import { useState, useCallback } from "react";
import NoteContext from "./noteContext";
import API_URL from "../../config";

const NoteState = (props) => {
  const host = API_URL;

  const [notes, setNotes] = useState([]);
  const [oneNote, setOneNote] = useState(null);

  // get all notes
  // Memoized so its identity is stable — otherwise a consumer's useEffect that depends on
  // getNotes would re-run on every render (setNotes -> re-render -> new getNotes -> ...),
  // causing an infinite re-fetch loop.
  const getNotes = useCallback(async () => {
    const response = await fetch(`${host}/api/notes/fetchallnotes`, {
      method: "GET",
      headers: {
        "Content-Type": "application/json",
        "auth-token": localStorage.getItem("token"),
      },
    });
    // An invalid/expired token must bubble up so the caller can redirect to login.
    if (response.status === 401) {
      localStorage.removeItem("token");
      throw new Error("Unauthorized");
    }
    if (!response.ok) {
      throw new Error("Failed to fetch notes");
    }
    const json = await response.json();
    setNotes(json.notes);
  }, [host]);

  // Add a note — returns true on success, false on failure so callers can gate feedback.
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
        throw new Error("Failed to add a note");
      }
      const json = await response.json();
      setNotes((prevNotes) => [...prevNotes, json.savedNote]);
      return true;
    } catch (error) {
      console.error("Error adding note:", error.message);
      return false;
    }
  };

  // Delete a note — optimistic update with rollback; returns true on success.
  const deleteNote = async (id) => {
    const previousNotes = notes;
    setNotes(notes.filter((note) => note._id !== id));

    try {
      const response = await fetch(`${host}/api/notes/deletenote/${id}`, {
        method: "DELETE",
        headers: {
          "Content-Type": "application/json",
          "auth-token": localStorage.getItem("token"),
        },
      });
      if (!response.ok) {
        throw new Error("Failed to delete the note");
      }
      return true;
    } catch (error) {
      console.error("Error deleting note:", error.message);
      setNotes(previousNotes);
      return false;
    }
  };

  // Edit a note — only updates local state after the server confirms; returns true on success.
  const editNote = async (id, title, description, tag) => {
    try {
      const response = await fetch(`${host}/api/notes/updatenote/${id}`, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
          "auth-token": localStorage.getItem("token"),
        },
        body: JSON.stringify({ title, description, tag }),
      });
      if (!response.ok) {
        throw new Error("Failed to update the note");
      }

      setNotes((prevNotes) =>
        prevNotes.map((note) =>
          note._id === id ? { ...note, title, description, tag } : note
        )
      );
      return true;
    } catch (error) {
      console.error("Error updating note:", error.message);
      return false;
    }
  };

  // get a specific note
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
    } catch (error) {
      console.error("Error getting note:", error.message);
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
