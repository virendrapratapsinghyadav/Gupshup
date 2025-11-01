import express from 'express'
import {ENV} from './utils/env.js';
import cookieParser from 'cookie-parser'
import cors from 'cors';
import path from 'path';
import authRoutes from './routes/auth.route.js';
import messageRoutes from './routes/message.route.js';
import { connectDB } from './utils/db.js';



const app = express();
const PORT = ENV.PORT || 8000;


//Public middlewares
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(cookieParser());



const __dirname = path.resolve();
if(ENV.NODE_ENV !== "production"){
    app.use(cors());
}


//Routes Connection
app.use('/api/auth', authRoutes);
app.use('/api/message', messageRoutes);

app.get('/',(req, res)=>{
    res.send("someone is here...")
})


//Database connection
connectDB()
 .then(() => {
    app.listen(ENV.PORT, () => {
      console.log(
        `Server is running on port http://localhost:${ENV.PORT}`
      );
    });
  })
  .catch(() => {
    console.log("Failed to connect DB");
  });


//Make ready for deployment
if(ENV.NODE_ENV === "production"){
    app.use(express.static(path.join(__dirname,"../frontend/dist")));

    app.get("*", (req, res)=>{
        res.sendFile(path.join(__dirname, "../frontend", "dist", "index.html"));
    })
}


