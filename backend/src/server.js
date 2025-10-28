import express from 'express'
import dotenv from 'dotenv'
dotenv.config();
import authRoutes from './routes/auth.route.js';
import messageRoutes from './routes/message.route.js';



const app = express();
const PORT = process.env.PORT || 8000;

app.listen(PORT,(req, res)=>{
    console.log(`Server is running on Port: http://localhost:${PORT}` )
});

app.use('/api/auth', authRoutes);
app.use('/api/message', messageRoutes);

app.get('/',(req, res)=>{
    res.send("someone is here...")
})