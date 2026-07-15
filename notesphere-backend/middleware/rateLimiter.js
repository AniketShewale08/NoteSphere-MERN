import rateLimit from "express-rate-limit";

// Limit repeated auth attempts (login / signup) to slow down brute-force attacks.
const authLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  limit: 10, // max 10 requests per window per IP
  standardHeaders: true,
  legacyHeaders: false,
  message: {
    success: false,
    error: "Too many attempts. Please try again after 15 minutes.",
  },
});

export default authLimiter;
