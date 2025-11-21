import express from "express";
import { Server } from "socket.io"; //Creates a WebSocket server for real-time events
import http from "http"; //Creates an HTTP server for Express
import { ENV } from "./Env.js";
import { Message } from "../models/message.model.js";
import socketAuthMiddleware from "../middlewares/socket.auth.middleware.js";

const app = express();
const server = http.createServer(app);

const io = new Server(server, {
  cors: {
    origin: "http://localhost:5173",
    credentials: true,
  },
});

//verify the user before allowing them to connect.
io.use(socketAuthMiddleware);

//object to store the online users
const userSocketMap = {}; //{userId: socketId}

//We will use this function to check if the user is online or not
export function getReceiverSocketId(userId) {
  return userSocketMap[userId];
}

io.on("connection", (socket) => {
  console.log("New connection of socket is formed", socket.user.fullName);

  const userId = socket.userId; //userId
  userSocketMap[userId] = socket.id; //socketId -> {userId: socketId}

  //OnlineUsers event
  io.emit("getOnlineUsers", Object.keys(userSocketMap));

  //Typing event
  socket.on("typing", (receiverId) => {
    const receiverSocketId = getReceiverSocketId(receiverId);
    if (receiverSocketId) {
      io.to(receiverSocketId).emit("typing", socket.user._id);
    }
  });

  socket.on("stopTyping", (receiverId) => {
    const receiverSocketId = getReceiverSocketId(receiverId);
    if (receiverSocketId) {
      io.to(receiverSocketId).emit("stopTyping", socket.user._id);
    }
  });

  socket.on("deleteMessage", async (messageId) => {
    try {
      const deletedMessage = await Message.findByIdAndDelete(messageId);
      if (!deletedMessage) return;
      
      const receiverSocketId = getReceiverSocketId(deletedMessage.receiverId);
      const senderSocketId = getReceiverSocketId(deletedMessage.senderId);

      // Notify the sender
      if (senderSocketId) {
        io.to(senderSocketId).emit("deleteMessage", messageId);
      }
      // Notify the receiver
      if (receiverSocketId) {
        io.to(receiverSocketId).emit("deleteMessage", messageId);
      }

    } catch (error) {
        console.error("Delete message error:", err);
    }
  });

  socket.on("disconnect", () => {
    console.log("Socket disconnected", socket.user.fullName);
    delete userSocketMap[userId];
    io.emit("getOnlineUsers", Object.keys(userSocketMap));
  });
});

export { server, io, app };
