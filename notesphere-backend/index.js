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
// Restrict cross-origin requests to the frontend origin (override with CLIENT_URL)
app.use(cors({ origin: process.env.CLIENT_URL || "http://localhost:3000" }))
app.use(express.json())

app.use('/api/auth', authRoutes);
app.use('/api/notes', notesRoutes);

app.listen(port, ()=> {
    console.log(`iNotebook at listening at http://localhost:${port}`)
})