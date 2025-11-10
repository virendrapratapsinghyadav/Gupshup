import {Server} from 'socket.io';
import http from 'http';
import express from 'express';
import { ENV } from './env.js';
import { socketAuthMiddleware } from '../middlewares/socket.auth.middleware.js';

const app = express();
const server = http.createServer(app);  //need this because Socket.IO attaches itself to an HTTP server

//Setting up socket.io 
const io = new Server(server, {
    cors: {
        origin: [ENV.CLIENT_URL, "http://localhost:5173"],
        credentials: true,
    }
});

//Applying authentication middleware to all socket connections
io.use(socketAuthMiddleware);


//This object stores which user is connected to which socket.
const userSocketMap = {}; //{userId:socketId}


io.on("connection", (socket)=>{
    console.log("A user connected", socket.user.fullName);

    //These 2 lines stores the mapping so you know which user is using which socket.
    const userId = socket.userId
    userSocketMap[userId] = socket.id

    //io.emit() is used to send events to all connected client
    io.emit("getOnlineUsers",  Object.keys(userSocketMap));

    socket.on("disconnect", ()=>{
        console.log("A user disconnected", socket.user.fullName);
        delete userSocketMap[userId];
        io.emit("getOnlineUsers", Object.keys(userSocketMap));
    })
})

export {io, app, server};

