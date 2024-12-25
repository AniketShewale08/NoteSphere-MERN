import React, { useContext, useEffect } from "react";
import noteContext from "../../context/notes/noteContext";
import Notesitems from "./Notesitems";
import AddNote from "./AddNotes";
import { useNavigate } from "react-router-dom";
import NoteView from "./NoteView";
import "./Notes.css";

const Notes = () => {
  const context = useContext(noteContext);
  const { notes, getNotes } = context;
  const navigate = useNavigate();

  useEffect(() => {
    if (localStorage.getItem("token")) {
      getNotes().catch((err) => {
        console.error("Error fetching notes:", err);
        navigate("/login");
      });
    } else {
      navigate("/login");
    }
  }, [getNotes, navigate]);

  return (
    <div className="container">
      <div className="row">
        <div className="col-lg-6 col-md-6 col-12">
          <AddNote />
        </div>
        <div className="col-lg-6 col-md-6 col-12" id="specific-note">
          <NoteView />
        </div>

        <div className="viewNotes">
          <h1 className="text-center">View Notes</h1>
          <div className="note-grid">
            {notes && notes.length > 0 ? (
              notes.map((note) => (
                <div className="note-item" key={note._id}>
                  <Notesitems note={note} />
                </div>
              ))
            ) : (
              <p style={{ textAlign: "center", width: "100%" }}>
                No notes available. Add some to get started!
              </p>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default Notes;
