import React, { useContext, useEffect, useRef, useState } from "react";
import noteContext from "../../context/notes/noteContext";
import alertContext from "../../context/alert/alertContext";
import {
  TITLE_TRUNCATE_LIMIT,
  DESCRIPTION_TRUNCATE_LIMIT,
} from "../../constants";
import "./Notesitems.css";

// How long the "Confirm delete?" affordance stays up before auto-reverting
// back to the normal Delete button if the user doesn't confirm or cancel.
const CONFIRM_REVERT_MS = 3000;

const Notesitems = (props) => {
  const context = useContext(noteContext);
  const { getOneNote, deleteNote, setOneNote } = context;
  const { showAlert } = useContext(alertContext);
  const { note } = props;

  const [confirmingDelete, setConfirmingDelete] = useState(false);
  const revertTimerRef = useRef(null);

  // Reset the confirm affordance whenever the note this card renders changes
  // (e.g. the list re-orders/re-renders after another note is added/removed),
  // so a stale "Confirm delete?" state never lingers on the wrong card.
  useEffect(() => {
    setConfirmingDelete(false);
    return () => clearTimeout(revertTimerRef.current);
  }, [note._id]);

  const handleDelete = async () => {
    clearTimeout(revertTimerRef.current);
    setConfirmingDelete(false);
    const success = await deleteNote(note._id);
    if (success) {
      setOneNote(null);
      showAlert("Note Deleted successfully", "success");
    } else {
      showAlert("Failed to delete note. Please try again.", "danger");
    }
  };

  const handleDeleteClick = () => {
    if (!confirmingDelete) {
      setConfirmingDelete(true);
      revertTimerRef.current = setTimeout(() => {
        setConfirmingDelete(false);
      }, CONFIRM_REVERT_MS);
      return;
    }
    handleDelete();
  };

  const handleCancelDelete = () => {
    clearTimeout(revertTimerRef.current);
    setConfirmingDelete(false);
  };

  const handleGetNote = () => {
    getOneNote(note._id);
    const noteViewElement = document.getElementById("specific-note");
    if (noteViewElement) {
      noteViewElement.scrollIntoView({ behavior: "smooth" });
    }
  };

  return (
    <>
      <div className="card">
        <div className="card-body">
          <h4 className="card-title">
            {note.title.length > TITLE_TRUNCATE_LIMIT
              ? `${note.title.slice(0, TITLE_TRUNCATE_LIMIT - 3)}...`
              : note.title}
          </h4>
          <p
            className="fa-solid card-subtitle my-1 card-tag"
            style={{ color: "blue" }}
          >
            {note.tag}
          </p>
          <p className="card-text">
            {note.description.length > DESCRIPTION_TRUNCATE_LIMIT
              ? `${note.description.slice(0, DESCRIPTION_TRUNCATE_LIMIT - 3)}...`
              : note.description}
          </p>
          <div className="card-actions">
            {confirmingDelete ? (
              <button
                className="btn me-3 btn-sm btn-secondary"
                onClick={handleCancelDelete}
                aria-label="Cancel delete"
                title="Cancel"
              >
                Cancel
              </button>
            ) : (
              <button
                className="btn me-3 btn-sm btn-secondary"
                onClick={handleGetNote}
              >
                View Note
              </button>
            )}
            <button
              className="btn btn-sm btn-danger me-2"
              onClick={handleDeleteClick}
              aria-label={
                confirmingDelete
                  ? `Confirm delete of note titled ${note.title}`
                  : `Delete note titled ${note.title}`
              }
              title={
                confirmingDelete
                  ? "Click again to permanently delete this note"
                  : "Delete note"
              }
            >
              {confirmingDelete ? "Confirm delete?" : "Delete Note"}
            </button>
          </div>
        </div>
      </div>
    </>
  );
};

export default Notesitems;
