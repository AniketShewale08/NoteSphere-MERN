// Shared, single-source-of-truth limits for the note-list CARD PREVIEW
// (Notesitems.js) — these are NOT storage/input limits. A note's title and
// description can be any length in the database and in the full note view
// (NoteView.js); these constants only control how much of that text is
// shown before truncating with "..." on the note-list cards, and are also
// used by AddNotes.js/NoteView.js to power the informational "your text
// will be truncated in the preview" hints shown near those fields.
export const TITLE_TRUNCATE_LIMIT = 20;
export const DESCRIPTION_TRUNCATE_LIMIT = 130;
