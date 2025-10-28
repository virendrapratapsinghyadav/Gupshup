import express from 'express'
import dotenv from 'dotenv'
dotenv.config();
import cors from 'cors';
import path from 'path';
import authRoutes from './routes/auth.route.js';
import messageRoutes from './routes/message.route.js';



const app = express();
const PORT = process.env.PORT || 8000;

if(process.env.NODE_ENV !== "production"){
    app.use(cors());
}

const __dirname = path.resolve();

//Make ready for deployment
if(process.env.NODE_ENV === "production"){
    app.use(express.static(path.join(__dirname,"../frontend/dist")));

    app.get("*", (req, res)=>{
        res.sendFile(path.join(__dirname, "../frontend", "dist", "index.html"));
    })
}

app.listen(PORT,(req, res)=>{
    console.log(`Server is running on Port: http://localhost:${PORT}` )
});

app.use('/api/auth', authRoutes);
app.use('/api/message', messageRoutes);

app.get('/',(req, res)=>{
    res.send("someone is here...")
})