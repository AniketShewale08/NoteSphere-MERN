import { renderEmail } from "./baseEmailTemplate.js";
import { APP_NAME } from "../config/email.config.js";

// Builds the Welcome email content. Reuses the shared renderEmail() layout so there is
// no duplicated HTML/email logic — this file only supplies the welcome-specific content.

// The app URL used for the call-to-action button.
// CLIENT_URL may be a comma-separated list, so we use the first origin.
const getAppUrl = () =>
  (process.env.CLIENT_URL || "http://localhost:3000").split(",")[0].trim();

/**
 * Build the Welcome email for a newly registered user.
 * @param {string} name - The new user's name (personalizes the greeting).
 * @returns {{ subject: string, html: string }}
 */
export const buildWelcomeEmail = (name) => {
  const displayName = (name || "there").trim();

  const subject = `Welcome to ${APP_NAME} 🎉`;

  const html = renderEmail({
    title: `Welcome, ${displayName}!`,
    message:
      `Thanks for joining ${APP_NAME} — your notebook on the cloud. ` +
      `You can now create, organize, tag, and search your notes from anywhere. ` +
      `We're glad to have you on board!`,
    button: { text: `Open ${APP_NAME}`, url: getAppUrl() },
  });

  return { subject, html };
};

export default buildWelcomeEmail;
