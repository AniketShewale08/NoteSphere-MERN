import { useState, useCallback } from "react";
import NoteContext from "./noteContext";
import API_URL from "../../config";

const NoteState = (props) => {
  const host = API_URL;

  const [notes, setNotes] = useState([]);
  const [oneNote, setOneNote] = useState(null);
  const [nextCursor, setNextCursor] = useState(null);
  const [hasMore, setHasMore] = useState(false);
  const [isLoadingMore, setIsLoadingMore] = useState(false);

  // Fetch one page of notes. Without a cursor this is "page 1" — it replaces
  // the notes array and resets pagination state. With a cursor it appends.
  // Memoized (deps: [host] only) so getNotes/getNotesPage below can safely depend on it
  // without picking up a new function identity on every render.
  const fetchNotesPage = useCallback(
    async (cursor) => {
      const url = new URL(`${host}/api/notes/fetchallnotes`);
      if (cursor) {
        url.searchParams.set("cursor", cursor);
      }

      const response = await fetch(url, {
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

      setNotes((prevNotes) =>
        cursor ? [...prevNotes, ...json.notes] : json.notes
      );
      setNextCursor(json.pagination.nextCursor);
      setHasMore(json.pagination.hasMore);
    },
    [host]
  );

  // get all notes (page 1) — resets the notes array and pagination state.
  // Memoized so its identity is stable — otherwise a consumer's useEffect that depends on
  // getNotes would re-run on every render (setNotes -> re-render -> new getNotes -> ...),
  // causing an infinite re-fetch loop.
  const getNotes = useCallback(async () => {
    await fetchNotesPage();
  }, [fetchNotesPage]);

  // Fetch one page of notes starting after `cursor` and append it to the existing list.
  // Guarded against duplicate concurrent calls and calls made once there's no more data.
  const getNotesPage = useCallback(
    async (cursor = nextCursor) => {
      if (isLoadingMore || !hasMore || !cursor) {
        return;
      }

      setIsLoadingMore(true);
      try {
        await fetchNotesPage(cursor);
      } catch (error) {
        console.error("Error fetching more notes:", error.message);
      } finally {
        setIsLoadingMore(false);
      }
    },
    [fetchNotesPage, isLoadingMore, hasMore, nextCursor]
  );

  // Shared by every note-mutating call below: on a 401 the token is dead, so clear it and
  // throw a recognizable error the caller can catch to redirect to /login — the same
  // contract fetchNotesPage above already uses for the initial notes fetch.
  const throwIfUnauthorized = (response) => {
    if (response.status === 401) {
      localStorage.removeItem("token");
      throw new Error("Unauthorized");
    }
  };

  // Add a note — returns true on success, false on failure so callers can gate feedback.
  // Throws "Unauthorized" (rather than returning false) on an expired/invalid session, so
  // the caller can redirect to login instead of showing a generic "failed to add" message.
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
      throwIfUnauthorized(response);
      if (!response.ok) {
        throw new Error("Failed to add a note");
      }
      const json = await response.json();
      // Prepend, not append — the API serves notes newest-first, so a freshly added
      // note belongs at the top of the list, not the bottom.
      setNotes((prevNotes) => [json.savedNote, ...prevNotes]);
      return true;
    } catch (error) {
      if (error.message === "Unauthorized") {
        throw error;
      }
      console.error("Error adding note:", error.message);
      return false;
    }
  };

  // Delete a note — optimistic update with rollback; returns true on success.
  // Uses the functional setState form throughout (never reads the `notes` closure directly)
  // so a rapid double-delete or a concurrent add/edit can't be discarded by a stale snapshot.
  const deleteNote = async (id) => {
    let removedNote;
    let removedIndex;
    setNotes((prevNotes) => {
      removedIndex = prevNotes.findIndex((note) => note._id === id);
      removedNote = prevNotes[removedIndex];
      return prevNotes.filter((note) => note._id !== id);
    });

    try {
      const response = await fetch(`${host}/api/notes/deletenote/${id}`, {
        method: "DELETE",
        headers: {
          "Content-Type": "application/json",
          "auth-token": localStorage.getItem("token"),
        },
      });
      throwIfUnauthorized(response);
      if (!response.ok) {
        throw new Error("Failed to delete the note");
      }
      return true;
    } catch (error) {
      if (error.message === "Unauthorized") {
        throw error;
      }
      console.error("Error deleting note:", error.message);
      // Roll back with a functional update, re-inserting at the original position, instead
      // of restoring a stale full-array snapshot that could discard other concurrent changes.
      if (removedNote) {
        setNotes((prevNotes) => {
          const next = [...prevNotes];
          next.splice(Math.min(removedIndex, next.length), 0, removedNote);
          return next;
        });
      }
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
      throwIfUnauthorized(response);
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
      if (error.message === "Unauthorized") {
        throw error;
      }
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

      throwIfUnauthorized(response);
      if (!response.ok) {
        throw new Error("Failed to get a note");
      }
      const json = await response.json();
      setOneNote(json.note);
    } catch (error) {
      if (error.message === "Unauthorized") {
        throw error;
      }
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
        getNotesPage,
        hasMore,
        isLoadingMore,
        getOneNote,
        setOneNote,
      }}
    >
      {props.children}
    </NoteContext.Provider>
  );
};

export default NoteState;
