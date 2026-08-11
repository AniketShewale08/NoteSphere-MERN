import express from "express";
import Notes from "../models/Notes.js";
import { body, validationResult } from "express-validator";
import fetchuser from "../middleware/fetchuser.js";
import { apiLimiter } from "../middleware/rateLimiter.js";
const router = express.Router();

// All note routes require a logged-in user and share the general rate limiter.
router.use(apiLimiter);

// GET /api/notes/fetchallnotes : get all notes for the logged-in user
router.get("/fetchallnotes", fetchuser, async (req, res) => {
  try {
    const notes = await Notes.find({ user: req.user.id });
    res.json({ notes });
  } catch (error) {
    console.error("Error fetching notes:", error.message);
    res.status(500).json({ success: false, error: "Internal server error." });
  }
});

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

// PUT /api/notes/updatenote/:id : update a note the user owns
router.put("/updatenote/:id", fetchuser, async (req, res) => {
  try {
    const { title, description, tag } = req.body;
    const newNote = {};
    if (title) newNote.title = title;
    if (description) newNote.description = description;
    if (tag) newNote.tag = tag;

    // Treat "not found" and "not yours" identically (404) so note ids can't be enumerated.
    let note = await Notes.findById(req.params.id);
    if (!note || note.user.toString() !== req.user.id) {
      return res.status(404).json({ success: false, error: "Note not found." });
    }

    note = await Notes.findByIdAndUpdate(
      req.params.id,
      { $set: newNote },
      { new: true }
    );
    res.json({ note });
  } catch (error) {
    console.error("Error updating note:", error.message);
    res.status(500).json({ success: false, error: "Internal server error." });
  }
});

// DELETE /api/notes/deletenote/:id : delete a note the user owns
router.delete("/deletenote/:id", fetchuser, async (req, res) => {
  try {
    let note = await Notes.findById(req.params.id);
    if (!note || note.user.toString() !== req.user.id) {
      return res.status(404).json({ success: false, error: "Note not found." });
    }

    await Notes.findByIdAndDelete(req.params.id);
    res.json({ success: true, message: "Note deleted successfully." });
  } catch (error) {
    console.error("Error deleting note:", error.message);
    res.status(500).json({ success: false, error: "Internal server error." });
  }
});

// GET /api/notes/getNote/:id : get a single note the user owns
router.get("/getNote/:id", fetchuser, async (req, res) => {
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
});

export default router;
