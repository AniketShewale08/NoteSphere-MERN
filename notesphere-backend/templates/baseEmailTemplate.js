import { APP_NAME } from "../config/email.config.js";

// Reusable, responsive HTML email layout.
// Future emails (welcome, reset password, verification, ...) call renderEmail() with
// their own content so every email shares one consistent, mobile-friendly design.

// Escape dynamic values so they cannot break the markup or inject HTML.
const escapeHtml = (value = "") =>
  String(value)
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&#39;");

/**
 * Build a responsive HTML email.
 * @param {Object} options
 * @param {string} options.title    - Main heading shown in the email.
 * @param {string} options.message  - Body text (plain string, rendered in a paragraph).
 * @param {{ text: string, url: string }} [options.button] - Optional call-to-action button.
 * @param {string} [options.appName] - Overrides the app/brand name (defaults to APP_NAME).
 * @param {string} [options.footer]  - Optional footer note.
 * @returns {string} A complete HTML document as a string.
 */
export const renderEmail = ({
  title,
  message,
  button,
  appName,
  footer,
} = {}) => {
  const brand = escapeHtml(appName || APP_NAME);
  const safeTitle = escapeHtml(title || "");
  const safeMessage = escapeHtml(message || "");
  const safeFooter = escapeHtml(
    footer || `You received this email from ${appName || APP_NAME}.`
  );

  const buttonHtml =
    button && button.url && button.text
      ? `
                  <tr>
                    <td align="center" style="padding:8px 0 4px;">
                      <a href="${escapeHtml(button.url)}"
                         style="display:inline-block; background:#6366f1; color:#ffffff;
                                text-decoration:none; font-weight:600; padding:12px 28px;
                                border-radius:8px; font-size:15px;">
                        ${escapeHtml(button.text)}
                      </a>
                    </td>
                  </tr>`
      : "";

  return `<!DOCTYPE html>
<html lang="en">
  <head>
    <meta charset="utf-8" />
    <meta name="viewport" content="width=device-width, initial-scale=1.0" />
    <title>${safeTitle}</title>
  </head>
  <body style="margin:0; padding:0; background:#f1f5f9;
               font-family:Arial,Helvetica,sans-serif; color:#1e293b;">
    <table role="presentation" width="100%" cellpadding="0" cellspacing="0"
           style="background:#f1f5f9; padding:24px 12px;">
      <tr>
        <td align="center">
          <table role="presentation" width="100%" cellpadding="0" cellspacing="0"
                 style="max-width:520px; background:#ffffff; border-radius:16px;
                        overflow:hidden; box-shadow:0 6px 24px rgba(15,23,42,0.08);">
            <tr>
              <td align="center"
                  style="background:linear-gradient(135deg,#6366f1,#8b5cf6);
                         padding:28px 24px; color:#ffffff; font-size:22px; font-weight:700;">
                ${brand}
              </td>
            </tr>
            <tr>
              <td style="padding:32px 28px;">
                <table role="presentation" width="100%" cellpadding="0" cellspacing="0">
                  <tr>
                    <td style="font-size:20px; font-weight:700; padding-bottom:12px;">
                      ${safeTitle}
                    </td>
                  </tr>
                  <tr>
                    <td style="font-size:15px; line-height:1.6; color:#475569;
                               padding-bottom:20px;">
                      ${safeMessage}
                    </td>
                  </tr>${buttonHtml}
                </table>
              </td>
            </tr>
            <tr>
              <td style="padding:18px 24px; background:#f8fafc; color:#94a3b8;
                         font-size:12px; text-align:center;">
                ${safeFooter}<br />
                &copy; ${new Date().getFullYear()} ${brand}
              </td>
            </tr>
          </table>
        </td>
      </tr>
    </table>
  </body>
</html>`;
};

export default renderEmail;
