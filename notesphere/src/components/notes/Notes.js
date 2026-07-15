import React, { useContext, useEffect, useState } from "react";
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

  const [search, setSearch] = useState("");
  const [filteredNotes, setFilteredNotes] = useState([]);

  const handleSearch = (e) => {
    setSearch(e.target.value);
  }

  useEffect(()=>{
    if (!search){
      setFilteredNotes(notes);
      return;
    }
    const searchNotes = notes.filter((note) =>{
      const titleMatch = note.title.toLowerCase().includes(search.toString().toLowerCase());
      const tagMatch = note.tag.toLowerCase().includes(search.toString().toLowerCase());

      return titleMatch || tagMatch;
    })  
    setFilteredNotes(searchNotes);
  }, [notes, search])

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
          <h1 className="text-center" style={{fontWeight: "bold"}}>View Notes</h1>
          <div className="search-container">
            <label htmlFor="search" className="text-center">
              Search Notes by Title or Tag
            </label>
            <div className="input-with-icon">
              <i className="fas fa-search search-icon"></i>
              <input
                type="text"
                className="form-control"
                id="search"
                name="search"
                placeholder="Type a note title or tag to search..."
                onChange={handleSearch}
              />
            </div>
          </div>
          <div 
            className={`note-grid ${filteredNotes && filteredNotes.length === 0 ? 'no-notes' : ''}`}
          >
            {filteredNotes && filteredNotes.length > 0 ? (
              filteredNotes.map((note) => (
                <div className="note-item" key={note._id}>
                  <Notesitems note={note} />
                </div>
              ))
            ) : (
              <div className="empty-notes-message">
                No notes are available. Add some to get started!
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default Notes;
