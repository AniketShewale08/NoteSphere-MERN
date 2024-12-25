import React, { useContext, useState } from "react";
import noteContext from "../../context/notes/noteContext";
import alertContext from "../../context/alert/alertContext";
import "./AddNotes.css";

const AddNote = () => {
  const context = useContext(noteContext);
  const { showAlert } = useContext(alertContext);

  const { addNote, getNotes } = context;
  const [note, setNote] = useState({ title: "", description: "", tag: "" });

  const handleClick = async (e) => {
    e.preventDefault();
    if (
      note.title.length === 0 ||
      note.description.length === 0 ||
      note.tag.length === 0
    ) {
      showAlert("Please enter value!", "warning");
      return;
    }
    await addNote(note.title, note.description, note.tag);
    getNotes();
    showAlert("Note Added Successfully", "success");
    setNote({ title: "", description: "", tag: "" });
  };

  const onChange = (e) => {
    setNote({ ...note, [e.target.name]: e.target.value });
  };

  return (
    <div className="notes-container">
      <div className="row">
        {/* Left Side: Add Notes */}
        <div className="col-lg-4 col-md-5 col-12 add-note-section">
          <h2 className="text-center mb-4">Add Notes</h2>
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
              />
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
              />
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
            >
              Add Note
            </button>
          </form>
        </div>
      </div>
    </div>
  );
};

export default AddNote;
