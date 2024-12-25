import React, { useContext } from "react";
import noteContext from "../../context/notes/noteContext";
import alertContext from "../../context/alert/alertContext";
import "./Notesitems.css";

const Notesitems = (props) => {
  const context = useContext(noteContext);
  const { getOneNote, deleteNote, setOneNote } = context;
  const { showAlert } = useContext(alertContext);
  const { note } = props;

  const handleDelete = () => {
    deleteNote(note._id);
    setOneNote({ oneNote: null });
    showAlert("Note Deleted successfully", "success");
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
            {note.title.length > 20
              ? `${note.title.slice(0, 17)}...`
              : note.title}
          </h4>
          <p
            className="fa-solid card-subtitle my-1 card-tag"
            style={{ color: "blue" }}
          >
            {note.tag}
          </p>
          <p className="card-text">
            {note.description.length > 80
              ? `${note.description.slice(0, 77)}...`
              : note.description}
          </p>
          <div className="card-actions">
            <button
              className="fa-solid btn me-3 btn-sm btn-secondary"
              id="specific-note"
              onClick={handleGetNote}
            >
              View Note
            </button>
            <button
              className="fa-solid btn btn-sm btn-danger me-2"
              onClick={handleDelete}
            >
              Delete Note
            </button>
          </div>
        </div>
      </div>
    </>
  );
};

export default Notesitems;