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
    }
});

const User = mongoose.model('user', UserSchema);
export default User;