import React, { useContext, useState } from "react";
import { useNavigate } from "react-router-dom";
import noteContext from "../../context/notes/noteContext";
import alertContext from "../../context/alert/alertContext";
import {
  TITLE_TRUNCATE_LIMIT,
  DESCRIPTION_TRUNCATE_LIMIT,
} from "../../constants";
import "./AddNotes.css";

const AddNote = () => {
  const context = useContext(noteContext);
  const { showAlert } = useContext(alertContext);
  const navigate = useNavigate();

  const { addNote } = context;
  const [note, setNote] = useState({ title: "", description: "", tag: "" });
  const [loading, setLoading] = useState(false);

  const handleClick = async (e) => {
    e.preventDefault();
    // Tag is optional — the backend defaults it to "general" when left blank.
    if (note.title.length === 0 || note.description.length === 0) {
      showAlert("Please enter a title and description!", "warning");
      return;
    }
    setLoading(true);
    try {
      const success = await addNote(note.title, note.description, note.tag);
      if (success) {
        showAlert("Note Added Successfully", "success");
        setNote({ title: "", description: "", tag: "" });
      } else {
        showAlert("Failed to add note. Please try again.", "danger");
      }
    } catch (error) {
      if (error.message === "Unauthorized") {
        navigate("/login");
      } else {
        showAlert("Failed to add note. Please try again.", "danger");
      }
    } finally {
      setLoading(false);
    }
  };

  const onChange = (e) => {
    setNote({ ...note, [e.target.name]: e.target.value });
  };

  // Purely derived from existing `note` state — not new state of its own.
  // Drives the informational (non-error) hint telling the user their text
  // will be truncated in the notes-list card preview, not on save.
  const isTitleOverPreviewLimit = note.title.length > TITLE_TRUNCATE_LIMIT;
  const isDescriptionOverPreviewLimit =
    note.description.length > DESCRIPTION_TRUNCATE_LIMIT;

  return (
    <div className="notes-container">
      <div className="row">
        {/* Left Side: Add Notes */}
        <div className="col-12 add-note-section">
          {/* This page's only h1 — first heading in DOM order on the notes
              page (AddNotes, then NoteView, then the "View Notes" list all
              nest under it as h2s). */}
          <h1 className="text-center mb-4">Add Notes</h1>
          <form>
            <div className="mb-3">
              <label htmlFor="title" className="form-label">
                Title
              </label>
              <input
                type="text"
                className="form-control"
                id="title"
                name="title"
                placeholder="Enter note title"
                value={note.title}
                onChange={onChange}
                maxLength={200}
                aria-describedby="titleLengthHint"
              />
              <p
                id="titleLengthHint"
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
              <label htmlFor="description" className="form-label">
                Description
              </label>
              <textarea
                className="form-control"
                id="description"
                name="description"
                placeholder="Enter note description"
                rows="4"
                value={note.description}
                onChange={onChange}
                maxLength={5000}
                aria-describedby="descriptionLengthHint"
              />
              <p
                id="descriptionLengthHint"
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
              <label htmlFor="tag" className="form-label">
                Tag
              </label>
              <input
                type="text"
                className="form-control"
                id="tag"
                name="tag"
                placeholder="Enter tag"
                value={note.tag}
                onChange={onChange}
              />
            </div>
            <button
              type="submit"
              className="btn btn-primary w-100 mb-3"
              onClick={handleClick}
              disabled={loading}
            >
              {loading ? "Adding..." : "Add Note"}
            </button>
          </form>
        </div>
      </div>
    </div>
  );
};

export default AddNote;
