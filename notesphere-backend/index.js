import express from 'express';
import cors from 'cors';
import * as dotenv from 'dotenv';
dotenv.config();

import validateEnv from './config/validateEnv.js';
import connectToMongo from './db.js';
import authRoutes from './routes/auth.js';
import notesRoutes from './routes/notes.js';

// Fail fast on misconfiguration before accepting any traffic.
validateEnv();
connectToMongo();

const app = express();
const port = process.env.PORT || 5000;
const isProduction = process.env.NODE_ENV === "production";

// Trust the first proxy (Render/Railway/Nginx/etc.) so express-rate-limit and req.ip
// see the real client IP instead of the proxy's.
app.set("trust proxy", 1);

// Allowed frontend origins. Production trusts only CLIENT_URL; in development we also allow
// localhost / private-LAN origins so laptop + phone testing works without extra config.
const allowedOrigins = (process.env.CLIENT_URL || "http://localhost:3000")
  .split(",")
  .map((o) => o.trim())
  .filter(Boolean);

// http(s)://  localhost | 127.0.0.1 | 10.x | 192.168.x | 172.16-31.x  (any port)
const isPrivateNetworkOrigin = (origin) =>
  /^https?:\/\/(localhost|127\.0\.0\.1|10(\.\d{1,3}){3}|192\.168(\.\d{1,3}){2}|172\.(1[6-9]|2\d|3[01])(\.\d{1,3}){2})(:\d+)?$/.test(
    origin
  );

app.use(
  cors({
    origin: (origin, callback) => {
      const allowed =
        !origin ||
        allowedOrigins.includes(origin) ||
        (!isProduction && isPrivateNetworkOrigin(origin));
      callback(null, allowed);
    },
  })
);

// Baseline security headers (dependency-free).
app.use((req, res, next) => {
  res.setHeader("X-Content-Type-Options", "nosniff");
  res.setHeader("X-Frame-Options", "DENY");
  res.setHeader("Referrer-Policy", "no-referrer");
  next();
});

app.use(express.json({ limit: "100kb" }));

app.use('/api/auth', authRoutes);
app.use('/api/notes', notesRoutes);

// 404 for any unmatched route.
app.use((req, res) => {
  res.status(404).json({ success: false, error: "Route not found." });
});

// Central error handler — always returns a generic message, never a stack trace.
// eslint-disable-next-line no-unused-vars
app.use((err, req, res, next) => {
  console.error("Unhandled error:", err.message);
  res.status(500).json({ success: false, error: "Internal server error." });
});

app.listen(port, () => {
  console.log(`NoteSphere backend listening on port ${port}`);
});
