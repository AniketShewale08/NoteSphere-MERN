import React, { useContext, useState, useRef, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import noteContext from "../../context/notes/noteContext";
import "./NoteView.css";
import {
  FaArrowLeft,
  FaPen,
  FaTrash,
  FaRegClock,
  FaTimes,
} from "react-icons/fa";
import NoteImg1 from "../assets/images/Note1.png";
import NoteImg2 from "../assets/images/Note2.png";
import alertContext from "../../context/alert/alertContext";
import BrandLogo from "../common/BrandLogo";
import {
  TITLE_TRUNCATE_LIMIT,
  DESCRIPTION_TRUNCATE_LIMIT,
} from "../../constants";

// How long the "Confirm delete?" affordance stays up before auto-reverting
// back to the normal Delete button if the user doesn't confirm or cancel.
const CONFIRM_REVERT_MS = 3000;

function NoteView() {
  const context = useContext(noteContext);
  const ref = useRef(null);
  const refClose = useRef(null);
  const { oneNote, setOneNote, deleteNote, editNote } = context;
  const { showAlert } = useContext(alertContext);
  const navigate = useNavigate();
  const [currentImg, setCurrentImg] = useState("imgage1");
  const [note, setNote] = useState({
    id: "",
    etitle: "",
    edescription: "",
    etag: "",
  });

  const [confirmingDelete, setConfirmingDelete] = useState(false);
  const revertTimerRef = useRef(null);

  // Reset the confirm affordance whenever the viewed note changes (e.g. the
  // user opens a different note, or navigates back to the empty state —
  // oneNote is null there, hence the optional chaining below), so a stale
  // "Confirm delete?" state never lingers on the wrong note.
  useEffect(() => {
    setConfirmingDelete(false);
    return () => clearTimeout(revertTimerRef.current);
  }, [oneNote?._id]);

  const handleBackToNotes = () => {
    setOneNote(null);
  };

  const handleDelete = async () => {
    clearTimeout(revertTimerRef.current);
    setConfirmingDelete(false);
    try {
      const success = await deleteNote(oneNote._id);
      if (success) {
        setOneNote(null);
        showAlert("Note Deleted Successfully", "success");
      } else {
        showAlert("Failed to delete note. Please try again.", "danger");
      }
    } catch (error) {
      if (error.message === "Unauthorized") {
        navigate("/login");
      } else {
        showAlert("Failed to delete note. Please try again.", "danger");
      }
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

  const updateNote = (currentNote) => {
    ref.current.click();
    setNote({
      id: currentNote._id,
      etitle: currentNote.title,
      edescription: currentNote.description,
      etag: currentNote.tag,
    });
  };

  const handleClick = async () => {
    // Only reflect the edit in the UI after the server confirms it.
    try {
      const success = await editNote(
        note.id,
        note.etitle,
        note.edescription,
        note.etag
      );
      if (success) {
        setOneNote({
          ...oneNote,
          title: note.etitle,
          description: note.edescription,
          tag: note.etag,
        });
        showAlert("Note Updated Successfully", "success");
        refClose.current.click();
      } else {
        showAlert("Failed to update note. Please try again.", "danger");
      }
    } catch (error) {
      if (error.message === "Unauthorized") {
        navigate("/login");
      } else {
        showAlert("Failed to update note. Please try again.", "danger");
      }
    }
  };

  const onChange = (e) => {
    setNote({ ...note, [e.target.name]: e.target.value });
  };

  // Purely derived from existing `note` state — not new state of its own.
  // Drives the informational (non-error) hint telling the user their text
  // will be truncated in the notes-list card preview, not on save.
  const isTitleOverPreviewLimit = note.etitle.length > TITLE_TRUNCATE_LIMIT;
  const isDescriptionOverPreviewLimit =
    note.edescription.length > DESCRIPTION_TRUNCATE_LIMIT;

  // The alternating placeholder image only ever renders in the empty state
  // below (no note selected). Previously this interval ran unconditionally
  // for the component's entire lifetime, re-rendering every second even
  // while a note was open and the image wasn't on screen at all.
  useEffect(() => {
    if (oneNote && oneNote.title) return undefined;
    const interval = setInterval(() => {
      setCurrentImg((prevImg) =>
        prevImg === "imgage1" ? "imgage2" : "imgage1"
      );
    }, 1000);
    return () => clearInterval(interval);
  }, [oneNote]);
  return (
    <>
      {/* Hidden Button to Trigger Modal */}
      <button
        type="button"
        className="btn btn-primary d-none"
        data-bs-toggle="modal"
        data-bs-target="#exampleModal"
        ref={ref}
      >
        Launch modal
      </button>

      {/* Modal for Editing Notes */}
      <div
        className="modal fade"
        id="exampleModal"
        tabIndex="-1"
        aria-labelledby="exampleModalLabel"
        aria-hidden="true"
      >
        <div className="modal-dialog modal-dialog-centered modal-dialog-scrollable">
          <div className="modal-content">
            <div className="modal-header">
              <h5 className="modal-title" id="exampleModalLabel">
                Edit Note
              </h5>
              <button
                type="button"
                className="btn-close"
                data-bs-dismiss="modal"
                aria-label="Close"
              ></button>
            </div>
            <div className="modal-body">
              <form>
                <div className="mb-3">
                  <label htmlFor="etitle" className="form-label">
                    Title
                  </label>
                  <input
                    type="text"
                    id="etitle"
                    name="etitle"
                    value={note.etitle}
                    onChange={onChange}
                    className="form-control"
                    maxLength={200}
                    aria-describedby="etitleLengthHint"
                  />
                  <p
                    id="etitleLengthHint"
                    className={`field-info-note${
                      isTitleOverPreviewLimit ? " is-visible" : ""
                    }`}
                    aria-live="polite"
                  >
                    {isTitleOverPreviewLimit
                      ? `Heads up — only the first ${TITLE_TRUNCATE_LIMIT} characters will show in the notes list preview. The full title is always visible when you open the note.`
                      : ""}
                  </p>
                </div>
                <div className="mb-3">
                  <label htmlFor="edescription" className="form-label">
                    Description
                  </label>
                  <textarea
                    id="edescription"
                    name="edescription"
                    value={note.edescription}
                    onChange={onChange}
                    className="form-control"
                    rows={6}
                    maxLength={5000}
                    aria-describedby="edescriptionLengthHint"
                  ></textarea>
                  <p
                    id="edescriptionLengthHint"
                    className={`field-info-note${
                      isDescriptionOverPreviewLimit ? " is-visible" : ""
                    }`}
                    aria-live="polite"
                  >
                    {isDescriptionOverPreviewLimit
                      ? `Heads up — only the first ${DESCRIPTION_TRUNCATE_LIMIT} characters will show in the notes list preview. The full description is always visible when you open the note.`
                      : ""}
                  </p>
                </div>
                <div className="mb-3">
                  <label htmlFor="etag" className="form-label">
                    Tag
                  </label>
                  <input
                    type="text"
                    className="form-control"
                    id="etag"
                    name="etag"
                    value={note.etag}
                    onChange={onChange}
                  />
                </div>
              </form>
            </div>
            <div className="modal-footer">
              <button
                type="button"
                className="btn btn-secondary"
                data-bs-dismiss="modal"
                ref={refClose}
              >
                Close
              </button>
              <button
                type="button"
                className="btn btn-primary"
                onClick={handleClick}
              >
                Update Note
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Note View Section */}
      <div className="note-view-container">
        {oneNote && oneNote.title ? (
          <div className="note-content">
            <button
              className="btn btn-sm btn-primary note-back-btn mb-2"
              onClick={handleBackToNotes}
              aria-label="Back to notes"
              title="Back to notes"
            >
              <FaArrowLeft />
            </button>

            {/* Full text, never truncated — this IS the "open the note" view the
                app's own hint text (AddNotes.js / the edit modal) promises full
                text is always visible in. Truncation only ever belongs on the
                note-LIST card preview (Notesitems.js), which uses the same
                shared TITLE_TRUNCATE_LIMIT/DESCRIPTION_TRUNCATE_LIMIT constants. */}
            <h2 className="text-center my-2">{oneNote.title}</h2>
            <p className="note-tag text-center my-2">{oneNote.tag}</p>

            {oneNote.date && (
              <p className="note-date">
                <FaRegClock />
                {new Date(oneNote.date).toLocaleDateString(undefined, {
                  year: "numeric",
                  month: "short",
                  day: "numeric",
                })}
              </p>
            )}

            <div className="note-actions">
              {confirmingDelete ? (
                <button
                  className="btn btn-sm btn-secondary note-action-btn"
                  onClick={handleCancelDelete}
                  aria-label="Cancel delete"
                  title="Cancel"
                >
                  <FaTimes /> Cancel
                </button>
              ) : (
                <button
                  className="btn btn-sm btn-secondary note-action-btn"
                  onClick={() => updateNote(oneNote)}
                >
                  <FaPen /> Update
                </button>
              )}
              <button
                className="btn btn-sm btn-danger note-action-btn"
                onClick={handleDeleteClick}
                aria-label={
                  confirmingDelete
                    ? `Confirm delete of note titled ${oneNote.title}`
                    : `Delete note titled ${oneNote.title}`
                }
                title={
                  confirmingDelete
                    ? "Click again to permanently delete this note"
                    : "Delete note"
                }
              >
                <FaTrash /> {confirmingDelete ? "Confirm delete?" : "Delete"}
              </button>
            </div>

            <p className="note-description">{oneNote.description}</p>
          </div>
        ) : (
          <div className="empty-note-message">
              <img
                src={currentImg === "imgage1" ? NoteImg1 : NoteImg2}
                alt="No Note Selected"
                className="empty-note-image"/>
              <h2>
                Welcome to <BrandLogo nSize={32} gradient />
              </h2>
              <p className="lead">
                Capture your ideas and thoughts seamlessly with our intuitive
                platform.
              </p>
          </div>
        )}
      </div>
    </>
  );
}

export default NoteView;
