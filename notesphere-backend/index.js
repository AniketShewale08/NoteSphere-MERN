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

// Allowed frontend origins — comma-separated list in CLIENT_URL
// (e.g. "http://localhost:3000,http://192.168.1.100:3000").
// Requests with no Origin header (curl, mobile webviews, same-origin) are allowed.
const allowedOrigins = (process.env.CLIENT_URL || "http://localhost:3000")
  .split(",")
  .map((o) => o.trim())
  .filter(Boolean);
app.use(
  cors({
    origin: (origin, callback) =>
      callback(null, !origin || allowedOrigins.includes(origin)),
  })
);
app.use(express.json())

app.use('/api/auth', authRoutes);
app.use('/api/notes', notesRoutes);

app.listen(port, ()=> {
    console.log(`iNotebook at listening at http://localhost:${port}`)
})