import mongoose from "mongoose";
const {Schema} = mongoose;

const UserSchema = new Schema({
    name:{
        type:String,
        required:true
    },
    email:{
        type:String,
        required:true,
        unique:true
    },
    password:{
        type:String,
        required:true
    },
    date:{
        type:Date,
        default:Date.now
    },
    // Password reset: we store the HASH of the reset token (never the raw token),
    // plus an expiry timestamp. Both are cleared once the password is reset.
    resetPasswordToken:{
        type:String
    },
    resetPasswordExpires:{
        type:Date
    },
    // Incremented every time the password is reset. Embedded in each JWT at
    // sign time (see routes/auth.js) and checked on every request (see
    // middleware/fetchuser.js) — a mismatch means the token was issued before
    // the most recent reset, so it's rejected even though it hasn't expired yet.
    tokenVersion:{
        type:Number,
        default:0
    },
    // Email verification — a soft, non-blocking confirmation (see routes/auth.js
    // verify-email/resend-verification): an unverified user can still log in and
    // use the app fully, they just see a reminder banner until they click the
    // link. Same hashed-token + expiry pattern as password reset above.
    isVerified:{
        type:Boolean,
        default:false
    },
    verificationToken:{
        type:String
    },
    verificationTokenExpires:{
        type:Date
    }
});

const User = mongoose.model('user', UserSchema);
export default User;