import { renderEmail } from "./baseEmailTemplate.js";
import { APP_NAME } from "../config/email.config.js";

// Builds the Verify Email content. Reuses the shared renderEmail() layout so there is
// no duplicated HTML/email logic — this file only supplies the verification-specific
// content (matching the welcomeEmail.js / passwordResetEmail.js pattern).

/**
 * Build the Verify Email message.
 * @param {string} name      - The user's name (personalizes the greeting).
 * @param {string} verifyUrl - Full URL the user clicks to confirm their email.
 * @returns {{ subject: string, html: string }}
 */
export const buildVerificationEmail = (name, verifyUrl) => {
  const displayName = (name || "there").trim();

  const subject = `Confirm your ${APP_NAME} email address`;

  const html = renderEmail({
    title: "Confirm your email",
    message:
      `Hi ${displayName}, thanks for joining ${APP_NAME}. Click the button below to confirm ` +
      `this is your email address. This link expires in 24 hours. ` +
      `You can keep using ${APP_NAME} in the meantime — this is just to confirm we can reach you.`,
    button: { text: "Verify Email", url: verifyUrl },
  });

  return { subject, html };
};

export default buildVerificationEmail;
