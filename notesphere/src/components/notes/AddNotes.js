import React, { useContext, useState } from "react";
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
          <h2 className="text-center mb-4">Add Notes</h2>
          <form>
            <div className="mb-3">
              <div className="field-label-row">
                <label htmlFor="title" className="form-label mb-0">
                  Title
                </label>
                <small
                  id="titleCounter"
                  className={`char-counter${
                    isTitleOverPreviewLimit ? " char-counter-warning" : ""
                  }`}
                >
                  {note.title.length} / {TITLE_TRUNCATE_LIMIT}
                </small>
              </div>
              <input
                type="text"
                className="form-control"
                id="title"
                name="title"
                placeholder="Enter note title"
                value={note.title}
                onChange={onChange}
                aria-describedby="titleCounter titleLengthHint"
              />
              <p
                id="titleLengthHint"
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
                <label htmlFor="description" className="form-label mb-0">
                  Description
                </label>
                <small
                  id="descriptionCounter"
                  className={`char-counter${
                    isDescriptionOverPreviewLimit
                      ? " char-counter-warning"
                      : ""
                  }`}
                >
                  {note.description.length} / {DESCRIPTION_TRUNCATE_LIMIT}
                </small>
              </div>
              <textarea
                className="form-control"
                id="description"
                name="description"
                placeholder="Enter note description"
                rows="4"
                value={note.description}
                onChange={onChange}
                aria-describedby="descriptionCounter descriptionLengthHint"
              />
              <p
                id="descriptionLengthHint"
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
