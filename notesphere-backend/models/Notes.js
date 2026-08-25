import mongoose from "mongoose";
const {Schema} = mongoose;

const NotesSchema = new Schema({
    user :{
        type : mongoose.Schema.Types.ObjectId,
        ref : "user"
    },
    title:{
        type:String,
        required:true,
        // Defense-in-depth: the route-level express-validator check in
        // routes/notes.js is the primary gate; this is a backstop against
        // any other write path (scripts, a future route) bypassing it.
        maxlength: 200
    },
    description:{
        type:String,
        required:true,
        maxlength: 5000
    },
    tag:{
        type:String,
        default:"general"
    },
    date:{
        type:Date,
        default:Date.now
    }
}, {
    // Index creation is deliberate, not automatic: with autoIndex on (Mongoose's default),
    // the index below would build against the live collection the next time the server
    // starts. Build it manually (Atlas UI or mongosh) when ready, instead of on a deploy.
    autoIndex: false
});

// Matches fetchallnotes' cursor pagination: filter by user, sort newest-first by _id.
// NOT built automatically — see autoIndex: false above. Build manually:
//   db.notes.createIndex({ user: 1, _id: -1 })
NotesSchema.index({ user: 1, _id: -1 });

const Notes = mongoose.model('notes', NotesSchema);
export default Notes;