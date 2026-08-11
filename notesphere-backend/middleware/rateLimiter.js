import rateLimit from "express-rate-limit";

const baseOptions = {
  windowMs: 15 * 60 * 1000, // 15 minutes
  standardHeaders: true,
  legacyHeaders: false,
};

// Strict limiter for auth endpoints (login / signup / password reset) to slow brute-force.
const authLimiter = rateLimit({
  ...baseOptions,
  limit: 10,
  message: {
    success: false,
    error: "Too many attempts. Please try again after 15 minutes.",
  },
});

// General limiter for the rest of the API to prevent abuse.
const apiLimiter = rateLimit({
  ...baseOptions,
  limit: 200,
  message: {
    success: false,
    error: "Too many requests. Please try again later.",
  },
});

export default authLimiter;
export { authLimiter, apiLimiter };
