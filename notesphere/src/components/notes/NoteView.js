import React, { useContext, useState, useRef, useEffect } from "react";
import noteContext from "../../context/notes/noteContext";
import "./NoteView.css";
import { FaArrowLeft, FaPen, FaTrash, FaRegClock } from "react-icons/fa";
import NoteImg1 from "../assets/images/Note1.png";
import NoteImg2 from "../assets/images/Note2.png";
import alertContext from "../../context/alert/alertContext";
import BrandLogo from "../common/BrandLogo";
import {
  TITLE_TRUNCATE_LIMIT,
  DESCRIPTION_TRUNCATE_LIMIT,
} from "../../constants";

function NoteView() {
  const context = useContext(noteContext);
  const ref = useRef(null);
  const refClose = useRef(null);
  const { oneNote, setOneNote, deleteNote, editNote } = context;
  const { showAlert } = useContext(alertContext);
  const [currentImg, setCurrentImg] = useState("imgage1");
  const [note, setNote] = useState({
    id: "",
    etitle: "",
    edescription: "",
    etag: "",
  });

  const handleBackToNotes = () => {
    setOneNote(null);
  };

  const handleDelete = async () => {
    const success = await deleteNote(oneNote._id);
    if (success) {
      setOneNote(null);
      showAlert("Note Deleted Successfully", "success");
    } else {
      showAlert("Failed to delete note. Please try again.", "danger");
    }
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
                  <div className="field-label-row">
                    <label htmlFor="etitle" className="form-label mb-0">
                      Title
                    </label>
                    <small
                      id="etitleCounter"
                      className={`char-counter${
                        isTitleOverPreviewLimit ? " char-counter-warning" : ""
                      }`}
                    >
                      {note.etitle.length} / {TITLE_TRUNCATE_LIMIT}
                    </small>
                  </div>
                  <input
                    type="text"
                    id="etitle"
                    name="etitle"
                    value={note.etitle}
                    onChange={onChange}
                    className="form-control"
                    aria-describedby="etitleCounter etitleLengthHint"
                  />
                  <p
                    id="etitleLengthHint"
                    className={`field-info-note${
                      isTitleOverPreviewLimit ? " is-visible" : ""
                    }`}
                    aria-live="polite"
                  >
                    {isTitleOverPreviewLimit
                      ? `Only the first ${TITLE_TRUNCATE_LIMIT} characters will show in the notes list preview — full text is always visible when you open the note.`
                      : ""}
                  </p>
                </div>
                <div className="mb-3">
                  <div className="field-label-row">
                    <label htmlFor="edescription" className="form-label mb-0">
                      Description
                    </label>
                    <small
                      id="edescriptionCounter"
                      className={`char-counter${
                        isDescriptionOverPreviewLimit
                          ? " char-counter-warning"
                          : ""
                      }`}
                    >
                      {note.edescription.length} / {DESCRIPTION_TRUNCATE_LIMIT}
                    </small>
                  </div>
                  <textarea
                    id="edescription"
                    name="edescription"
                    value={note.edescription}
                    onChange={onChange}
                    className="form-control"
                    rows={6}
                    aria-describedby="edescriptionCounter edescriptionLengthHint"
                  ></textarea>
                  <p
                    id="edescriptionLengthHint"
                    className={`field-info-note${
                      isDescriptionOverPreviewLimit ? " is-visible" : ""
                    }`}
                    aria-live="polite"
                  >
                    {isDescriptionOverPreviewLimit
                      ? `Only the first ${DESCRIPTION_TRUNCATE_LIMIT} characters will show in the notes list preview — full text is always visible when you open the note.`
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

            <h1 className="text-center my-2">{oneNote.title.length > 24
              ? `${oneNote.title.slice(0, 21)}...`
              : oneNote.title}</h1>
            <h4 className="text-center my-2">
            {oneNote.tag?.length > 24
              ? `${oneNote.tag.slice(0, 21)}...`
              : oneNote.tag}
            </h4>

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
              <button
                className="btn btn-sm btn-secondary note-action-btn"
                onClick={() => updateNote(oneNote)}
              >
                <FaPen /> Update
              </button>
              <button
                className="btn btn-sm btn-danger note-action-btn"
                onClick={handleDelete}
              >
                <FaTrash /> Delete
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
