import express from 'express';
import User from "../models/User.js";
import { body, validationResult } from 'express-validator';
const router = express.Router();
import bcrypt from 'bcryptjs';
import jwt from "jsonwebtoken";
import fetchuser from '../middleware/fetchuser.js';
import authLimiter from '../middleware/rateLimiter.js';
import { sendEmail } from '../services/emailService.js';
import { buildWelcomeEmail } from '../templates/welcomeEmail.js';
import { buildPasswordResetEmail } from '../templates/passwordResetEmail.js';
import crypto from 'crypto';
import * as dotenv from "dotenv";
dotenv.config();

// POST request /api/auth/createuser : To create a new user
router.post("/createuser", authLimiter, [
    body("name").isLength({ min: 3 }).withMessage("Name must be at least 3 character long."),
    body("email").isEmail().withMessage("Invalid email address."),
    body("password").isLength({ min: 5 }).withMessage("Password must be at least 5 character long.")
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
          const authenticate = jwt.sign(data, process.env.JWT_SECRET, {
            expiresIn: "7d",
          });
          success = true;
          res.json({success, authenticate});

          // Send a welcome email in the background. This runs AFTER the response and is
          // not awaited, so email latency or failure can never block or fail registration.
          try {
            const { subject, html } = buildWelcomeEmail(user.name);
            sendEmail({ to: user.email, subject, html }).then((result) => {
              if (!result.success) {
                console.error(`[welcome-email] failed for ${user.email}: ${result.error}`);
              }
            });
          } catch (err) {
            console.error("[welcome-email] unexpected error:", err.message);
          }
    }
    // To handle the unexpected error
    catch(error){
        console.log("Error saving user:", error.message);
        res.status(500).json({ message: "An error occurred", error: error.message });
    }
});

// POST request /api/auth/login : to login user to the page
router.post('/login', authLimiter, [
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
        const authenticate = jwt.sign(data, process.env.JWT_SECRET, {
            expiresIn: "7d",
        });

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


// POST request /api/auth/forgot-password : request a password reset link
router.post('/forgot-password', authLimiter, [
    body("email").isEmail().withMessage("Invalid email address.")
], async (req, res) => {

    const errors = validationResult(req);
    if (!errors.isEmpty()) {
        return res.status(400).json({ success: false, errors: errors.array() });
    }

    // Always return the SAME response whether or not the email exists, so this endpoint
    // can't be used to discover which emails are registered (no account enumeration).
    const genericResponse = {
        success: true,
        message: "If an account with that email exists, a password reset link has been sent."
    };

    try {
        const user = await User.findOne({ email: req.body.email });

        if (user) {
            // Create a secure token. Store only its HASH; email the raw token in the link.
            const rawToken = crypto.randomBytes(32).toString('hex');
            const hashedToken = crypto.createHash('sha256').update(rawToken).digest('hex');

            user.resetPasswordToken = hashedToken;
            user.resetPasswordExpires = Date.now() + 15 * 60 * 1000; // 15 minutes
            await user.save();

            // Build the reset link from the first configured client origin.
            const clientUrl = (process.env.CLIENT_URL || "http://localhost:3000")
                .split(",")[0].trim();
            const resetUrl = `${clientUrl}/reset-password/${rawToken}`;

            const { subject, html } = buildPasswordResetEmail(user.name, resetUrl);
            const result = await sendEmail({ to: user.email, subject, html });
            if (!result.success) {
                console.error(`[reset-password] email failed for ${user.email}: ${result.error}`);
            }
        }

        return res.json(genericResponse);
    } catch (error) {
        // Log server-side but still return the generic response (never leak details).
        console.error("Error in forgot-password:", error.message);
        return res.json(genericResponse);
    }
});

// POST request /api/auth/reset-password/:token : set a new password using a valid token
router.post('/reset-password/:token', authLimiter, [
    body("password").isLength({ min: 5 }).withMessage("Password must be at least 5 character long.")
], async (req, res) => {

    const errors = validationResult(req);
    if (!errors.isEmpty()) {
        return res.status(400).json({ success: false, errors: errors.array() });
    }

    try {
        // Hash the incoming raw token the same way and find a matching, non-expired user.
        const hashedToken = crypto.createHash('sha256').update(req.params.token).digest('hex');
        const user = await User.findOne({
            resetPasswordToken: hashedToken,
            resetPasswordExpires: { $gt: Date.now() }
        });

        if (!user) {
            return res.status(400).json({ success: false, message: "This reset link is invalid or has expired." });
        }

        // Hash and save the new password, then clear the reset token so it can't be reused.
        const salt = await bcrypt.genSalt(10);
        user.password = await bcrypt.hash(req.body.password, salt);
        user.resetPasswordToken = undefined;
        user.resetPasswordExpires = undefined;
        await user.save();

        return res.json({ success: true, message: "Your password has been reset. You can now log in." });
    } catch (error) {
        console.error("Error in reset-password:", error.message);
        return res.status(500).json({ success: false, message: "Internal server error." });
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