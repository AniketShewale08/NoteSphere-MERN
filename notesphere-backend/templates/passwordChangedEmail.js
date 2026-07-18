import { renderEmail } from "./baseEmailTemplate.js";
import { APP_NAME } from "../config/email.config.js";

// Builds the "password changed" security-notification email. Reuses the shared
// renderEmail() layout (same pattern as welcomeEmail / passwordResetEmail).

// If the change wasn't the user, the button lets them jump straight to resetting.
// CLIENT_URL may be a comma-separated list, so we use the first origin.
const getForgotPasswordUrl = () =>
  `${(process.env.CLIENT_URL || "http://localhost:3000")
    .split(",")[0]
    .trim()}/forgot-password`;

/**
 * Build the "your password was changed" notification email.
 * @param {string} name - The user's name (personalizes the greeting).
 * @returns {{ subject: string, html: string }}
 */
export const buildPasswordChangedEmail = (name) => {
  const displayName = (name || "there").trim();

  const subject = `Your ${APP_NAME} password was changed`;

  const html = renderEmail({
    title: "Your password was changed",
    message:
      `Hi ${displayName}, this is a confirmation that your ${APP_NAME} password was just changed. ` +
      `If you made this change, no action is needed. ` +
      `If you did NOT change it, reset your password immediately using the button below ` +
      `and consider securing your email account.`,
    button: { text: "Reset Password", url: getForgotPasswordUrl() },
  });

  return { subject, html };
};

export default buildPasswordChangedEmail;
