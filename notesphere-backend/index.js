import express from 'express';
import connectToMongo from './db.js';
import authRoutes from './routes/auth.js';
import notesRoutes from './routes/notes.js';
import cors from 'cors';
connectToMongo();

const app = express()
const port = process.env.PORT
app.use(cors())
app.use(express.json())

app.use('/api/auth', authRoutes);
app.use('/api/notes', notesRoutes);

app.listen(port, ()=> {
    console.log(`iNotebook at listening at http://localhost:${port}`)
})