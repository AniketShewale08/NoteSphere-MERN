import nodemailer from "nodemailer";
import { getTransporter, EMAIL_FROM } from "../config/email.config.js";

// Centralised email sending service.
// This is the single place the app sends email from — future features (welcome,
// reset password, verification, notifications) call sendEmail() instead of
// duplicating transport logic.

// Basic email format check (kept dependency-free).
const EMAIL_REGEX = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

const isValidEmail = (value) =>
  typeof value === "string" && EMAIL_REGEX.test(value.trim());

// Reject values containing line breaks, which could inject extra email headers.
const hasHeaderInjection = (value) => /[\r\n]/.test(value || "");

/**
 * Send an email.
 * @param {Object} options
 * @param {string} options.to      - Recipient email address.
 * @param {string} options.subject - Email subject.
 * @param {string} [options.html]  - HTML body (build it with renderEmail() from templates).
 * @param {string} [options.text]  - Optional plain-text fallback.
 * @returns {Promise<{success: boolean, messageId?: string, previewUrl?: string, error?: string}>}
 */
export const sendEmail = async ({ to, subject, html, text } = {}) => {
  // Validate inputs. Return safe messages instead of throwing so callers can decide
  // whether an email failure should affect their own flow.
  if (!isValidEmail(to)) {
    return { success: false, error: "A valid recipient email address is required." };
  }
  if (!subject || hasHeaderInjection(subject)) {
    return { success: false, error: "A valid email subject is required." };
  }
  if (!html && !text) {
    return { success: false, error: "Email content (html or text) is required." };
  }

  try {
    const transporter = await getTransporter();

    const info = await transporter.sendMail({
      from: EMAIL_FROM,
      to: to.trim(),
      subject,
      text,
      html,
    });

    // Ethereal returns a preview URL; real SMTP returns false.
    const previewUrl = nodemailer.getTestMessageUrl(info) || undefined;
    if (previewUrl) {
      console.log(`[email] Preview URL: ${previewUrl}`);
    }

    return { success: true, messageId: info.messageId, previewUrl };
  } catch (error) {
    // Log full detail server-side; return a safe, generic message to the caller.
    console.error("[email] Failed to send email:", error.message);
    return {
      success: false,
      error: "Failed to send email. Please try again later.",
    };
  }
};

export default sendEmail;
