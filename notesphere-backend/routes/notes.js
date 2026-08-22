import express from "express";
import Notes from "../models/Notes.js";
import { body, param, query, validationResult } from "express-validator";
import fetchuser from "../middleware/fetchuser.js";
import { apiLimiter } from "../middleware/rateLimiter.js";
const router = express.Router();

// All note routes require a logged-in user and share the general rate limiter.
router.use(apiLimiter);

const DEFAULT_NOTES_LIMIT = 20;

// GET /api/notes/fetchallnotes : get a cursor-paginated page of notes for the logged-in user
router.get(
  "/fetchallnotes",
  fetchuser,
  [
    query("cursor")
      .optional()
      .isMongoId()
      .withMessage("Invalid cursor."),
    query("limit")
      .optional()
      .isInt({ min: 1, max: 100 })
      .withMessage("Limit must be an integer between 1 and 100."),
  ],
  async (req, res) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ success: false, errors: errors.array() });
    }

    try {
      const limit = req.query.limit
        ? parseInt(req.query.limit, 10)
        : DEFAULT_NOTES_LIMIT;

      const filter = { user: req.user.id };
      if (req.query.cursor) {
        // Newest-first by _id, so the next page is everything older than the cursor.
        filter._id = { $lt: req.query.cursor };
      }

      // Fetch one extra document so we know whether there's a next page
      // without running a separate count query, then trim it back off.
      const results = await Notes.find(filter)
        .sort({ _id: -1 })
        .limit(limit + 1);

      const hasMore = results.length > limit;
      const notes = hasMore ? results.slice(0, limit) : results;
      // Only expose a cursor when there is actually another page to fetch.
      const nextCursor = hasMore ? notes[notes.length - 1]._id : null;

      res.json({
        notes,
        pagination: {
          nextCursor,
          hasMore,
          count: notes.length,
        },
      });
    } catch (error) {
      console.error("Error fetching notes:", error.message);
      res.status(500).json({ success: false, error: "Internal server error." });
    }
  }
);

// POST /api/notes/addnotes : add a note
router.post(
  "/addnotes",
  fetchuser,
  [
    body("title").isLength({ min: 3 }).withMessage("Enter a valid title"),
    body("description")
      .isLength({ min: 5 })
      .withMessage("Description must be atleast 5 character"),
  ],
  async (req, res) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ success: false, errors: errors.array() });
    }

    try {
      const { title, description, tag } = req.body;

      // Only set tag when provided, so the schema default ("general") applies to blank tags.
      const note = new Notes({ title, description, user: req.user.id });
      if (tag) {
        note.tag = tag;
      }

      const savedNote = await note.save();
      res.status(201).json({ savedNote });
    } catch (error) {
      console.error("Error adding note:", error.message);
      res.status(500).json({ success: false, error: "Internal server error." });
    }
  }
);

// PUT /api/notes/updatenote/:id : update (partially) a note the user owns
router.put(
  "/updatenote/:id",
  fetchuser,
  [
    param("id").isMongoId().withMessage("Invalid note id."),
    // .optional() with no args only skips undefined (omitted) fields, not empty strings —
    // that's what makes an explicitly-sent "" still fail isLength() below instead of being
    // silently ignored like the old `if (title)` check used to do.
    body("title")
      .optional()
      .trim()
      .isLength({ min: 3 })
      .withMessage("Enter a valid title"),
    body("description")
      .optional()
      .trim()
      .isLength({ min: 5 })
      .withMessage("Description must be atleast 5 character"),
  ],
  async (req, res) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ success: false, errors: errors.array() });
    }

    try {
      const { title, description, tag } = req.body;
      const newNote = {};
      // Check !== undefined (not truthiness) so a provided, validated value is always applied;
      // fields the client omitted entirely stay untouched for this partial update.
      if (title !== undefined) newNote.title = title;
      if (description !== undefined) newNote.description = description;
      // Kept as truthiness (not !== undefined) to match addnotes' behavior: a blank tag is
      // treated as "no change" rather than clearing it, since the edit UI wasn't built with
      // deliberate tag-clearing in mind.
      if (tag) newNote.tag = tag;

      if (Object.keys(newNote).length === 0) {
        return res
          .status(400)
          .json({ success: false, error: "No fields to update." });
      }

      // Single atomic filter+update on _id AND user (no separate ownership read) — also
      // keeps "not found" and "not yours" indistinguishable (404) so ids can't be enumerated.
      const note = await Notes.findOneAndUpdate(
        { _id: req.params.id, user: req.user.id },
        { $set: newNote },
        { new: true }
      );
      if (!note) {
        return res.status(404).json({ success: false, error: "Note not found." });
      }

      res.json({ note });
    } catch (error) {
      console.error("Error updating note:", error.message);
      res.status(500).json({ success: false, error: "Internal server error." });
    }
  }
);

// DELETE /api/notes/deletenote/:id : delete a note the user owns
router.delete(
  "/deletenote/:id",
  fetchuser,
  [param("id").isMongoId().withMessage("Invalid note id.")],
  async (req, res) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ success: false, errors: errors.array() });
    }

    try {
      // Single atomic filter+delete on _id AND user — also keeps "not found" and "not yours"
      // indistinguishable (404) so ids can't be enumerated.
      const note = await Notes.findOneAndDelete({
        _id: req.params.id,
        user: req.user.id,
      });
      if (!note) {
        return res.status(404).json({ success: false, error: "Note not found." });
      }

      res.json({ success: true, message: "Note deleted successfully." });
    } catch (error) {
      console.error("Error deleting note:", error.message);
      res.status(500).json({ success: false, error: "Internal server error." });
    }
  }
);

// GET /api/notes/getNote/:id : get a single note the user owns
router.get(
  "/getNote/:id",
  fetchuser,
  [param("id").isMongoId().withMessage("Invalid note id.")],
  async (req, res) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ success: false, errors: errors.array() });
    }

    try {
      const note = await Notes.findById(req.params.id);
      if (!note || note.user.toString() !== req.user.id) {
        return res.status(404).json({ success: false, error: "Note not found." });
      }
      res.json({ note });
    } catch (error) {
      console.error("Error getting note:", error.message);
      res.status(500).json({ success: false, error: "Internal server error." });
    }
  }
);

export default router;
