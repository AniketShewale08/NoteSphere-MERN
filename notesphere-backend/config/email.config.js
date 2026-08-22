import nodemailer from "nodemailer";
import * as dotenv from "dotenv";
dotenv.config();

// Centralised email configuration.
// All EMAIL_* settings come from the environment so credentials never live in code.

export const APP_NAME = process.env.APP_NAME || "NoteSphere";
export const EMAIL_FROM =
  process.env.EMAIL_FROM || `${APP_NAME} <no-reply@localhost>`;

// SMTP is "configured" only when the essential credentials are present.
const isSmtpConfigured = () =>
  Boolean(
    process.env.EMAIL_HOST && process.env.EMAIL_USER && process.env.EMAIL_PASS
  );

// Real SMTP transport (production or any provider set via env).
const createSmtpTransporter = () =>
  nodemailer.createTransport({
    host: process.env.EMAIL_HOST,
    port: Number(process.env.EMAIL_PORT) || 587,
    secure: process.env.EMAIL_SECURE === "true", // true for port 465, false for 587
    auth: {
      user: process.env.EMAIL_USER,
      pass: process.env.EMAIL_PASS,
    },
  });

// Development fallback: a throwaway Ethereal test account.
// Emails are not delivered; each send produces a preview URL instead.
const createEtherealTransporter = async () => {
  const testAccount = await nodemailer.createTestAccount();
  console.log(
    "[email] No SMTP configured — using an Ethereal test account (dev). " +
      "Emails are not delivered; a preview URL is logged for each send."
  );
  return nodemailer.createTransport({
    host: "smtp.ethereal.email",
    port: 587,
    secure: false,
    auth: { user: testAccount.user, pass: testAccount.pass },
  });
};

// Cache the transporter (as a promise) so it is created once and reused.
let transporterPromise = null;

// Returns a cached, ready-to-use Nodemailer transporter.
// Uses real SMTP when configured, otherwise an Ethereal test account — but never in
// production. validateEnv() already requires real SMTP credentials whenever
// NODE_ENV=production, so the production-refusal branch below only ever fires as
// defense-in-depth: if that check is ever loosened or bypassed, a production server must
// fail loudly instead of silently routing real password-reset tokens through a throwaway
// test inbox. A failure here is never cached — only a successfully created transporter
// is — so a transient failure (e.g. Ethereal's account-creation network call) doesn't
// permanently wedge every future email send behind one bad first attempt.
export const getTransporter = () => {
  if (transporterPromise) {
    return transporterPromise;
  }

  const attempt = (async () => {
    if (isSmtpConfigured()) {
      return createSmtpTransporter();
    }
    if (process.env.NODE_ENV === "production") {
      throw new Error(
        "No SMTP configured in production — refusing to fall back to a test transport."
      );
    }
    return createEtherealTransporter();
  })();

  transporterPromise = attempt;
  attempt.catch(() => {
    // Let the failure surface to this call's caller, but don't let it poison future
    // calls — clear the cache so the next send attempt gets a fresh try.
    if (transporterPromise === attempt) {
      transporterPromise = null;
    }
  });

  return attempt;
};
