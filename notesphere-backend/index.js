import express from 'express';
import connectToMongo from './db.js';
import authRoutes from './routes/auth.js';
import notesRoutes from './routes/notes.js';
import cors from 'cors';
import * as dotenv from 'dotenv';
dotenv.config();
connectToMongo();

const app = express()
const port = process.env.PORT || 5000

// Allowed frontend origins.
// Explicit origins go in CLIENT_URL (comma-separated) — used for production domains.
// In addition, any localhost / private-LAN origin is allowed, so local + phone dev works
// from whatever IP the frontend auto-detects (no hardcoded IP to keep in sync).
// Requests with no Origin header (curl, mobile webviews, same-origin) are also allowed.
const allowedOrigins = (process.env.CLIENT_URL || "http://localhost:3000")
  .split(",")
  .map((o) => o.trim())
  .filter(Boolean);

// http(s)://  localhost | 127.0.0.1 | 10.x.x.x | 192.168.x.x | 172.16-31.x.x  (any port)
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
        isPrivateNetworkOrigin(origin);
      callback(null, allowed);
    },
  })
);
app.use(express.json())

app.use('/api/auth', authRoutes);
app.use('/api/notes', notesRoutes);

app.listen(port, ()=> {
    console.log(`iNotebook at listening at http://localhost:${port}`)
})