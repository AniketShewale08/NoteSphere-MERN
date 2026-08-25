import express from 'express';
import User from "../models/User.js";
import Notes from "../models/Notes.js";
import { body, validationResult } from 'express-validator';
const router = express.Router();
import bcrypt from 'bcryptjs';
import jwt from "jsonwebtoken";
import fetchuser from '../middleware/fetchuser.js';
import { authLimiter, apiLimiter } from '../middleware/rateLimiter.js';
import { sendEmail } from '../services/emailService.js';
import { buildWelcomeEmail } from '../templates/welcomeEmail.js';
import { buildPasswordResetEmail } from '../templates/passwordResetEmail.js';
import { buildPasswordChangedEmail } from '../templates/passwordChangedEmail.js';
import { buildVerificationEmail } from '../templates/verificationEmail.js';
import crypto from 'crypto';
import * as dotenv from "dotenv";
dotenv.config();

// POST request /api/auth/createuser : To create a new user
router.post("/createuser", authLimiter, [
    body("name").isLength({ min: 3 }).withMessage("Name must be at least 3 character long."),
    body("email").isEmail().withMessage("Invalid email address."),
    body("password").isLength({ min: 6 }).withMessage("Password must be at least 6 character long.")
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

          // Email verification — soft/non-blocking (see verify-email/resend-verification
          // below): stored the same hashed-token + expiry way as password reset.
          const rawVerifyToken = crypto.randomBytes(32).toString('hex');
          user.verificationToken = crypto.createHash('sha256').update(rawVerifyToken).digest('hex');
          user.verificationTokenExpires = Date.now() + 24 * 60 * 60 * 1000; // 24 hours
          await user.save();

          const data = {
            user :{
                id : user.id,
                tokenVersion: user.tokenVersion
            }
          }
          // JWT authentication
          const authenticate = jwt.sign(data, process.env.JWT_SECRET, {
            expiresIn: "7d",
          });
          success = true;
          res.status(201).json({success, authenticate});

          // Send the welcome + verification emails in the background. Both run AFTER
          // the response and are not awaited, so email latency or failure can never
          // block or fail registration.
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

          try {
            const clientUrl = (process.env.CLIENT_URL || "http://localhost:3000")
                .split(",")[0].trim();
            const verifyUrl = `${clientUrl}/verify-email/${rawVerifyToken}`;
            const { subject, html } = buildVerificationEmail(user.name, verifyUrl);
            sendEmail({ to: user.email, subject, html }).then((result) => {
              if (!result.success) {
                console.error(`[verification-email] failed for ${user.email}: ${result.error}`);
              }
            });
          } catch (err) {
            console.error("[verification-email] unexpected error:", err.message);
          }
    }
    // To handle the unexpected error
    catch(error){
        // A duplicate email can slip past the findOne check under a race — the unique index
        // still catches it. Map it to a clean 400 instead of a generic 500.
        if (error.code === 11000) {
            return res.status(400).json({ success: false, message: "This email is already exist." });
        }
        console.error("Error in createuser:", error.message);
        res.status(500).json({ success: false, message: "Internal server error." });
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
                id:user.id,
                tokenVersion: user.tokenVersion
            }
        };
        const authenticate = jwt.sign(data, process.env.JWT_SECRET, {
            expiresIn: "7d",
        });

        // sending authentication token as a json object. name/isVerified are included
        // so the frontend can show them (navbar avatar initials, verify-email banner)
        // without a second round trip right after login.
        success = true;
        res.json({success,authenticate, name: user.name, isVerified: user.isVerified});

    }
    // handling errors in catch block
    catch(error){
        console.error("Error in login:", error.message);
        res.status(500).json({success:false, error:"Internal server error."})
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
    body("password").isLength({ min: 6 }).withMessage("Password must be at least 6 character long.")
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
        // Bump tokenVersion so every JWT issued before this reset — including one an
        // attacker may have obtained — stops working immediately, rather than staying
        // valid for up to 7 more days. fetchuser checks this on every request.
        user.tokenVersion = (user.tokenVersion || 0) + 1;
        await user.save();

        // Notify the user that their password changed (security heads-up). Fire-and-forget —
        // this must never block or fail the password reset itself.
        try {
            const { subject, html } = buildPasswordChangedEmail(user.name);
            sendEmail({ to: user.email, subject, html }).then((result) => {
                if (!result.success) {
                    console.error(`[password-changed] email failed for ${user.email}: ${result.error}`);
                }
            });
        } catch (err) {
            console.error("[password-changed] unexpected error:", err.message);
        }

        return res.json({ success: true, message: "Your password has been reset. You can now log in." });
    } catch (error) {
        console.error("Error in reset-password:", error.message);
        return res.status(500).json({ success: false, message: "Internal server error." });
    }
});

// POST request /api/auth/verify-email/:token : confirm a user's email address using
// the link sent by createuser/resend-verification. Non-blocking feature — this just
// flips isVerified to true; it never affects whether the user can log in or use the app.
router.post('/verify-email/:token', apiLimiter, async (req, res) => {
    try {
        // Hash the incoming raw token the same way as reset-password above and find
        // a matching, non-expired user.
        const hashedToken = crypto.createHash('sha256').update(req.params.token).digest('hex');
        const user = await User.findOne({
            verificationToken: hashedToken,
            verificationTokenExpires: { $gt: Date.now() }
        });

        if (!user) {
            return res.status(400).json({ success: false, message: "This verification link is invalid or has expired." });
        }

        if (user.isVerified) {
            // Already verified (e.g. link clicked twice) — treat as success, not an error.
            return res.json({ success: true, message: "Your email is already verified." });
        }

        user.isVerified = true;
        user.verificationToken = undefined;
        user.verificationTokenExpires = undefined;
        await user.save();

        return res.json({ success: true, message: "Your email has been verified. Thanks!" });
    } catch (error) {
        console.error("Error in verify-email:", error.message);
        return res.status(500).json({ success: false, message: "Internal server error." });
    }
});

// POST request /api/auth/resend-verification : send a fresh verification link.
// Same anti-enumeration pattern as forgot-password — always the same generic response,
// whether or not the email exists or is already verified.
router.post('/resend-verification', authLimiter, [
    body("email").isEmail().withMessage("Invalid email address.")
], async (req, res) => {

    const errors = validationResult(req);
    if (!errors.isEmpty()) {
        return res.status(400).json({ success: false, errors: errors.array() });
    }

    const genericResponse = {
        success: true,
        message: "If an account with that email exists and needs verification, a new link has been sent."
    };

    try {
        const user = await User.findOne({ email: req.body.email });

        if (user && !user.isVerified) {
            const rawVerifyToken = crypto.randomBytes(32).toString('hex');
            user.verificationToken = crypto.createHash('sha256').update(rawVerifyToken).digest('hex');
            user.verificationTokenExpires = Date.now() + 24 * 60 * 60 * 1000; // 24 hours
            await user.save();

            const clientUrl = (process.env.CLIENT_URL || "http://localhost:3000")
                .split(",")[0].trim();
            const verifyUrl = `${clientUrl}/verify-email/${rawVerifyToken}`;

            const { subject, html } = buildVerificationEmail(user.name, verifyUrl);
            const result = await sendEmail({ to: user.email, subject, html });
            if (!result.success) {
                console.error(`[resend-verification] email failed for ${user.email}: ${result.error}`);
            }
        }

        return res.json(genericResponse);
    } catch (error) {
        console.error("Error in resend-verification:", error.message);
        return res.json(genericResponse);
    }
});

// POST request /api/auth/send-verification : resend the verification link to the
// LOGGED-IN user's own address. This is what the in-app reminder banner calls.
//
// Deliberately NOT the generic-response treatment that /resend-verification above
// uses: that endpoint is public, so it has to stay silent about whether an address
// exists. This one is JWT-gated and always uses req.user.id (the email in the body,
// if any, is ignored), so there's no account to enumerate — which means it can afford
// to tell the truth. That matters: a silently-swallowed SMTP failure looks identical
// to a delivered email from the user's side, and they just sit waiting for a message
// that never got sent.
router.post('/send-verification', authLimiter, fetchuser, async (req, res) => {
    try {
        const user = await User.findById(req.user.id);
        if (!user) {
            return res.status(404).json({ success: false, message: "User not found." });
        }

        if (user.isVerified) {
            // Not an error — the banner can just take itself down.
            return res.json({
                success: true,
                alreadyVerified: true,
                message: "Your email is already verified."
            });
        }

        const rawVerifyToken = crypto.randomBytes(32).toString('hex');
        user.verificationToken = crypto.createHash('sha256').update(rawVerifyToken).digest('hex');
        user.verificationTokenExpires = Date.now() + 24 * 60 * 60 * 1000; // 24 hours
        await user.save();

        const clientUrl = (process.env.CLIENT_URL || "http://localhost:3000")
            .split(",")[0].trim();
        const verifyUrl = `${clientUrl}/verify-email/${rawVerifyToken}`;

        const { subject, html } = buildVerificationEmail(user.name, verifyUrl);
        const result = await sendEmail({ to: user.email, subject, html });

        if (!result.success) {
            // Surface it instead of pretending it worked. The full reason goes to the
            // server log; the user gets a plain "it didn't send" they can act on.
            console.error(`[send-verification] email failed for ${user.email}: ${result.error}`);
            return res.status(502).json({
                success: false,
                message: "We couldn't send the email just now. Please try again in a moment."
            });
        }

        return res.json({
            success: true,
            message: `Verification link sent to ${user.email}.`
        });
    } catch (error) {
        console.error("Error in send-verification:", error.message);
        return res.status(500).json({ success: false, message: "Internal server error." });
    }
});


// POST request /getuser : To get a specific user
// Moved to apiLimiter — this is an ordinary authenticated call (e.g. the
// navbar's background profile backfill), not a brute-force-prone action
// like login/signup, so it shouldn't share authLimiter's tighter budget.
router.post('/getuser', apiLimiter, fetchuser, async (req, res)=> {

    try{
        const userId = req.user.id;
        const user = await User.findById(userId).select("-password")
        res.status(200).json({user})
    }
    catch(error){
        console.error("Error in getuser:", error.message);
        res.status(500).json({success:false, error:"Internal server error."})
    }
})

// GET request /api/auth/profile : personal info + note count for the profile page
router.get('/profile', apiLimiter, fetchuser, async (req, res) => {

    try{
        const user = await User.findById(req.user.id)
            .select("-password -resetPasswordToken -resetPasswordExpires -tokenVersion");
        if (!user) {
            return res.status(404).json({ success: false, error: "User not found." });
        }

        const notesCount = await Notes.countDocuments({ user: req.user.id });

        res.json({ success: true, user, notesCount });
    }
    catch(error){
        console.error("Error in profile:", error.message);
        res.status(500).json({success:false, error:"Internal server error."})
    }
});

// PUT request /api/auth/updateprofile : change the logged-in user's display name
router.put('/updateprofile', apiLimiter, fetchuser, [
    body("name").trim().isLength({ min: 3 }).withMessage("Name must be at least 3 character long.")
], async (req, res) => {

    const errors = validationResult(req);
    if (!errors.isEmpty()) {
        return res.status(400).json({ success: false, errors: errors.array() });
    }

    try{
        const user = await User.findByIdAndUpdate(
            req.user.id,
            { $set: { name: req.body.name } },
            { new: true }
        ).select("-password -resetPasswordToken -resetPasswordExpires -tokenVersion");

        if (!user) {
            return res.status(404).json({ success: false, error: "User not found." });
        }

        res.json({ success: true, user });
    }
    catch(error){
        console.error("Error in updateprofile:", error.message);
        res.status(500).json({success:false, error:"Internal server error."})
    }
});

// PUT request /api/auth/changepassword : update the logged-in user's password,
// given they already know their current one (distinct from the forgot-password
// email flow, which is for when they don't).
router.put('/changepassword', apiLimiter, fetchuser, [
    body("currentPassword").exists().withMessage("Current password is required."),
    body("newPassword").isLength({ min: 6 }).withMessage("New password must be at least 6 character long.")
], async (req, res) => {

    const errors = validationResult(req);
    if (!errors.isEmpty()) {
        return res.status(400).json({ success: false, errors: errors.array() });
    }

    try{
        const user = await User.findById(req.user.id);
        if (!user) {
            return res.status(404).json({ success: false, error: "User not found." });
        }

        const passwordCompare = await bcrypt.compare(req.body.currentPassword, user.password);
        if (!passwordCompare) {
            return res.status(400).json({ success: false, error: "Current password is incorrect." });
        }

        const salt = await bcrypt.genSalt(10);
        user.password = await bcrypt.hash(req.body.newPassword, salt);
        // Bump tokenVersion just like the forgot-password reset flow does — this
        // invalidates every existing token, including the one used for THIS
        // request, so we sign and return a fresh one below rather than leaving
        // the user logged out immediately after changing their own password.
        user.tokenVersion = (user.tokenVersion || 0) + 1;
        await user.save();

        const data = {
            user: {
                id: user.id,
                tokenVersion: user.tokenVersion
            }
        };
        const authenticate = jwt.sign(data, process.env.JWT_SECRET, {
            expiresIn: "7d",
        });

        // Security heads-up email, same as the forgot-password reset flow.
        // Fire-and-forget — must never block or fail the password change itself.
        try {
            const { subject, html } = buildPasswordChangedEmail(user.name);
            sendEmail({ to: user.email, subject, html }).then((result) => {
                if (!result.success) {
                    console.error(`[password-changed] email failed for ${user.email}: ${result.error}`);
                }
            });
        } catch (err) {
            console.error("[password-changed] unexpected error:", err.message);
        }

        res.json({ success: true, authenticate, message: "Password changed successfully." });
    }
    catch(error){
        console.error("Error in changepassword:", error.message);
        res.status(500).json({success:false, error:"Internal server error."})
    }
});

// DELETE request /api/auth/deleteaccount : permanently delete the logged-in user's
// account and every note they own. Requires the current password so this destructive,
// irreversible action can't be triggered by anyone other than the account owner (e.g.
// an unlocked device/session).
router.delete('/deleteaccount', apiLimiter, fetchuser, [
    body("password").exists().withMessage("Password is required to confirm account deletion.")
], async (req, res) => {

    const errors = validationResult(req);
    if (!errors.isEmpty()) {
        return res.status(400).json({ success: false, errors: errors.array() });
    }

    try{
        const user = await User.findById(req.user.id);
        if (!user) {
            return res.status(404).json({ success: false, error: "User not found." });
        }

        const passwordCompare = await bcrypt.compare(req.body.password, user.password);
        if (!passwordCompare) {
            return res.status(400).json({ success: false, error: "Incorrect password." });
        }

        // Notes first, then the user document — so a failure mid-way never leaves
        // orphaned notes pointing at a deleted user.
        await Notes.deleteMany({ user: req.user.id });
        await User.findByIdAndDelete(req.user.id);

        res.json({ success: true, message: "Account deleted successfully." });
    }
    catch(error){
        // Flagged distinctly since this runs after notes may already be gone — worth
        // finding quickly in logs if the user-document delete itself ever fails.
        console.error(`[CRITICAL] Error deleting account for user ${req.user.id}:`, error.message);
        res.status(500).json({success:false, error:"Internal server error."})
    }
});

export default router;