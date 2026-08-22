// Fail fast if critical environment variables are missing or unsafe, so the server never
// starts in a broken state (e.g. jwt.sign throwing on every request in production).
const validateEnv = () => {
  const required = ["MONGODB_URL", "JWT_SECRET"];

  // In production, real SMTP credentials are required too. Without this check, a missing
  // EMAIL_* var in production silently falls back to a throwaway Ethereal test account —
  // reset emails are never delivered, and a preview URL containing the raw password-reset
  // token gets logged to stdout instead (see config/email.config.js).
  if (process.env.NODE_ENV === "production") {
    required.push("EMAIL_HOST", "EMAIL_USER", "EMAIL_PASS");
  }

  const missing = required.filter((key) => !process.env[key]);

  if (missing.length > 0) {
    console.error(
      `Missing required environment variable(s): ${missing.join(", ")}. ` +
        "Set them in notesphere-backend/.env (or the host's env) before starting."
    );
    process.exit(1);
  }

  if (process.env.JWT_SECRET.length < 32) {
    console.error(
      "JWT_SECRET is too short — use a long, random secret (at least 32 characters)."
    );
    process.exit(1);
  }
};

export default validateEnv;
