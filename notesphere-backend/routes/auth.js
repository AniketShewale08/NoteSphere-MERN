import express from 'express';
import User from "../models/User.js";
import { body, validationResult } from 'express-validator';
const router = express.Router();
import bcrypt from 'bcryptjs';
import jwt from "jsonwebtoken";
import fetchuser from '../middleware/fetchuser.js';
import * as dotenv from "dotenv";
dotenv.config();

// POST request /api/auth/createuser : To create a new user
router.post("/createuser", [
    body("name").isLength(3).withMessage("Name must be at least 3 character long."),
    body("email").isEmail().withMessage("Invalid email address."),
    body("password").isLength(5).withMessage("Password must be at least 5 character long.")
], async (req, res) => {

    const errors = validationResult(req);
    let success = false;
    // If there is a error then it will return a specific error
    if (!errors.isEmpty()){
        success = false;
        return res.status(400).json({success, errors : errors.array()});
    }
    // try and catch to handle the unexpected errors
    try{
        // Finding the duplicate email in the database
        let user = await  User.findOne({email : req.body.email});
        // If the user with the same email exist then it will give return a error
        if(user){
            success = false;
            return res.status(400).json({success, message : "This email is already exist."});
        }

        // Adding extra salt to the password to increase the security of the password.
        const salt = await bcrypt.genSalt(10);
        const securePassword = await bcrypt.hash(req.body.password, salt);
        
        // Create a new user
        user = await User.create({
            name: req.body.name,
            email: req.body.email,
            password: securePassword,
          });

          const data = {
            user :{
                id : user.id
            }
          }
          // JWT authentication 
          const authenticate = jwt.sign(data, process.env.JWT_SECRET);
          success = true;
          res.json({success, authenticate});
    }
    // To handle the unexpected error
    catch(error){
        console.log("Error saving user:", error.message);
        res.status(500).json({ message: "An error occurred", error: error.message });
    }
});

// POST request /api/auth/login : to login user to the page
router.post('/login', [
    body("email").isEmail(),
    body('password').exists()
], async (req, res)=>{

    let success = false;
    // Validate request body and handle validation errors
    const errors = validationResult(req);
    if(!errors.isEmpty()){
        success = false;
        return res.status(400).json({success,error:errors.array()});
    }

    // Extract email and password from the request body
    const {email, password} = req.body;
    try{
        // Checking if the email exist in the database or not
        let user = await User.findOne({email});
        if(!user){
            success = false;
            return res.status(400).json({success, errors:"Please try to login with the correct credentials."});
        }
        // Compare the provided password with the hashed password in the database
        const passwordCompare = await bcrypt.compare(password, user.password);
        if(!passwordCompare){
            success = false;
            return res.status(400).json({success, errors : "Please try to login with the correct credentials."})
        }

        // Get the authenticated token.
        const data = {
            user:{
                id:user.id
            }
        };
        const authenticate = jwt.sign(data, process.env.JWT_SECRET);
        
        // sending authentication token as a json object.
        success = true;
        res.json({success,authenticate});

    }
    // handling errors in catch block
    catch(errors){
        console.log(errors);
        res.status(500).json({msg:"Internal server error."})
    }
});


// POST request /getuser : To get a specific user 
router.post('/getuser', fetchuser, async (req, res)=> {

    try{
        const userId = req.user.id;
        const user = await User.findById(userId).select("-password")
        res.status(200).json({user})  
    }
    catch(errors){
       console.log(errors);
        res.status(500).json({msg:"Internal server error."})
    }
})

export default router;