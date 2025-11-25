import express from 'express';
import dotenv from 'dotenv';
import connectDB from './configs/db.js';
import cors from 'cors';
import authRoutes from "./routes/authRoutes.js";
import adminRoutes from './routes/adminRoutes.js';

dotenv.config();

const app=express();
connectDB();


const PORT=process.env.PORT||8000;

app.use(express.json());
app.use(cors())


app.get('/',(req,res)=>{
    res.send('Hello World from the backend server!');
});

app.use('/api/auth', authRoutes);
app.use('/api/admin',adminRoutes)

app.listen(PORT,()=>{
    console.log(`Server is running on http://localhost:${PORT}`);
});