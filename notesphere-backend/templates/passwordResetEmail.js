import { renderEmail } from "./baseEmailTemplate.js";
import { APP_NAME } from "../config/email.config.js";

// Builds the Password Reset email content. Reuses the shared renderEmail() layout so
// there is no duplicated HTML/email logic — this file only supplies the reset-specific
// content (matching the welcomeEmail.js pattern).

/**
 * Build the Password Reset email.
 * @param {string} name     - The user's name (personalizes the greeting).
 * @param {string} resetUrl - Full URL the user clicks to set a new password.
 * @returns {{ subject: string, html: string }}
 */
export const buildPasswordResetEmail = (name, resetUrl) => {
  const displayName = (name || "there").trim();

  const subject = `Reset your ${APP_NAME} password`;

  const html = renderEmail({
    title: "Password reset requested",
    message:
      `Hi ${displayName}, we received a request to reset your ${APP_NAME} password. ` +
      `Click the button below to choose a new one. This link expires in 15 minutes. ` +
      `If you didn't request this, you can safely ignore this email — your password won't change.`,
    button: { text: "Reset Password", url: resetUrl },
  });

  return { subject, html };
};

export default buildPasswordResetEmail;
