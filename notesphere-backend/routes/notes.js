import express from "express";
import Notes from "../models/Notes.js";
import { body, validationResult } from "express-validator";
import fetchuser from "../middleware/fetchuser.js";
const router = express.Router();

// GET request /api/notes/getnotes
router.get("/fetchallnotes", fetchuser, async (req, res) => {
  try {
    const notes = await Notes.find({ user: req.user.id });
    res.json({ notes: notes });
  } catch (errors) {
    console.log(errors.message);
    res.status(500).json({ msg: "Internal server error" });
  }
});

// POST request /api/notes/addnotes : To add notes to the database
router.post(
  "/addnotes",
  fetchuser,
  [
    body("title").isLength(3).withMessage("Enter a valid title"),
    body("description")
      .isLength(5)
      .withMessage("Description must be atleast 5 character"),
  ],
  async (req, res) => {
    // validation on the input fields

    try {
      const { title, description, tag } = req.body;

      const errors = validationResult(req);
      if (!errors.isEmpty()) {
        return res.status(400).json({ errors: errors.array() });
      }

      // Create note object which stores all the data
      const note = new Notes({
        title,
        description,
        tag,
        user: req.user.id,
      });

      // save the notes on database
      const savedNote = await note.save();
      res.json({ savedNote });
    } catch (errors) {
      console.log(errors.message);
      res.status(500).json({ msg: "Internal server error" });
    }
  }
);

// PUT request /api/notes/updatenote : To update a specific note
router.put("/updatenote/:id", fetchuser, async (req, res) => {
  try {
    // getting the data from the request body
    const { title, description, tag } = req.body;
    // create a newNote which we will update into existing note
    const newNote = {};

    if (title) {
      newNote.title = title;
    }
    if (description) {
      newNote.description = description;
    }
    if (tag) {
      newNote.tag = tag;
    }

    // Find the id of the notes and check if the note exist or not
    let note = await Notes.findById(req.params.id);
    if (!note) {
      return res.status(404).json({ msg: "Note is not found" });
    }

    // check the passed user is equal to the actual note user or not
    if (note.user.toString() !== req.user.id) {
      return res.status(401).send("Not allowed.");
    }

    // Update the note 
    note = await Notes.findByIdAndUpdate(
      req.params.id,
      { $set: newNote },
      { new: true }
    );
    res.json({ note });
  } catch (errors) {
    console.log(errors.message);
    res.status(500).json({ msg: "Internal server error" });
  }
});

// DELETE request: api/notes/deletenote - Delete the existing note from the database

router.delete("/deletenote/:id", fetchuser, async (req, res) => {
  try {
    
    // See if the notes exist or not
    let note = await Notes.findById(req.params.id);
    if (!note) {
      return res.status(404).send("Not found");
    }

    // check if the owner of the notes
    if (note.user.toString() != req.user.id) {
      return res.status(401).send("Not allowed.");
    }

    // Delete the note with the specific id
    note = await Notes.findByIdAndDelete(req.params.id);
    res.json({ Success: "Note deleted successfully." });
  } catch (errors) {
    console.log(errors.message);
    res.status(500).json({ msg: "Internal server error" });
  }
});


router.get('/getNote/:id', fetchuser, async (req, res)=>{
  try{
    const note = await Notes.findById(req.params.id);
    if (!note) {
      return res.status(404).json({ msg: "Note is not found" });
    }
    if (note.user.toString() !== req.user.id) {
      return res.status(401).send("Not allowed.");
    }
    res.json({note : note});
    
  }
  catch (errors) {
    console.log(errors.message);
    res.status(500).json({ msg: "Internal server error" });
  }
  })


export default router;
