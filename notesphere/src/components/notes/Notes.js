import React, { useContext, useEffect, useState } from "react";
import noteContext from "../../context/notes/noteContext";
import Notesitems from "./Notesitems";
import AddNote from "./AddNotes";
import { useNavigate } from "react-router-dom";
import NoteView from "./NoteView";
import BackToTop from "../common/BackToTop";
import "./Notes.css";

// Below this many rendered notes, the floating "back to top" button is hidden
// on tablet-and-up (see .back-to-top-narrow-only). Matches the backend's page
// size, so a list that fits in one page doesn't get a scroll affordance it
// doesn't need on a wide, multi-column grid.
const BACK_TO_TOP_MIN_NOTES = 20;

const Notes = () => {
  const context = useContext(noteContext);
  const { notes, getNotes, getNotesPage, hasMore, isLoadingMore } = context;
  const navigate = useNavigate();

  const [search, setSearch] = useState("");
  const [filteredNotes, setFilteredNotes] = useState([]);
  // Tracks the initial fetch only, so the empty-state message doesn't flash
  // before getNotes() has a chance to resolve.
  const [isInitialLoading, setIsInitialLoading] = useState(true);

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
    if (!localStorage.getItem("token")) {
      navigate("/login");
      return;
    }
    getNotes()
      .catch((err) => {
        // Only bounce to login when the token is actually invalid/expired,
        // not on a transient network error.
        if (err.message === "Unauthorized") {
          navigate("/login");
        } else {
          console.error("Error fetching notes:", err.message);
        }
      })
      .finally(() => {
        setIsInitialLoading(false);
      });
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
          <h2 className="text-center" style={{fontWeight: "bold"}}>View Notes</h2>
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
            {isInitialLoading ? (
              <div className="empty-notes-message">Loading notes...</div>
            ) : filteredNotes && filteredNotes.length > 0 ? (
              filteredNotes.map((note) => (
                <div className="note-item" key={note._id}>
                  <Notesitems note={note} />
                </div>
              ))
            ) : search ? (
              // A zero-match search reads very differently from a genuinely empty
              // account — say so, and flag when matches might still exist on a page
              // that hasn't loaded yet (search only runs against notes already fetched).
              <div className="empty-notes-message">
                {hasMore
                  ? `No matches for "${search}" in the notes loaded so far. Load more notes to keep searching.`
                  : `No notes match "${search}".`}
              </div>
            ) : (
              <div className="empty-notes-message">
                No notes are available. Add some to get started!
              </div>
            )}
          </div>
          <div className="notes-actions">
            {hasMore && (
              <button
                type="button"
                className="btn btn-primary"
                onClick={() => getNotesPage()}
                disabled={isLoadingMore}
              >
                {isLoadingMore ? "Loading..." : "Load More"}
              </button>
            )}
            <BackToTop
              hideOnWideScreens={filteredNotes.length < BACK_TO_TOP_MIN_NOTES}
            />
          </div>
        </div>
      </div>
    </div>
  );
};

export default Notes;
