import React, { useContext, useState, useRef, useEffect } from "react";
import noteContext from "../../context/notes/noteContext";
import "./NoteView.css";
import { FaArrowLeft, FaPen, FaTrash, FaRegClock } from "react-icons/fa";
import NoteImg1 from "../assets/images/Note1.png";
import NoteImg2 from "../assets/images/Note2.png";
import alertContext from "../../context/alert/alertContext";

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

  const handleDelete = () => {
    deleteNote(oneNote._id);
    setOneNote(null);
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

  const handleClick = () => {
    // Update the note (editNote already updates the notes array in state)
    editNote(note.id, note.etitle, note.edescription, note.etag);
    setOneNote({
      ...oneNote,
      title: note.etitle,
      description: note.edescription,
      tag: note.etag,
    });
    showAlert("Note Updated Successfully", "success");
    refClose.current.click();
  };

  const onChange = (e) => {
    setNote({ ...note, [e.target.name]: e.target.value });
  };

  useEffect(() => {
    const interval = setInterval(() => {
      setCurrentImg((prevImg) =>
        prevImg === "imgage1" ? "imgage2" : "imgage1"
      );
    }, 1000);
    return () => clearInterval(interval);
  }, []);
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
        <div className="modal-dialog">
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
              <form className="my-3">
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
                  />
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
                  ></textarea>
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
            {oneNote.tag.length > 24
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
                Welcome to
                <span
                  style={{
                    transform: "rotate(28deg)",
                    display: "inline-block",
                    textAlign: "center",
                    fontFamily: "Georgia, serif",
                    fontSize: "20px",
                  }}
                >
                  <div className="ms-2">N</div>
                </span>
                <span className="n">oteSphere</span>
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
