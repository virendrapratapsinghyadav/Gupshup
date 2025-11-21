import { io } from 'socket.io-client';

const socket = io("http://localhost:8080"); // make sure port matches server

socket.on("connect", () => {
    console.log("✅ Connected to server. Socket ID:", socket.id);

    // Send a test message
    socket.emit("send_message", { text: "Hello from Node client!" });
});

socket.on("receive_message", (data) => {
    console.log("📩 Message from server:", data);
});

socket.on("disconnect", () => console.log("❌ Disconnected from server"));
  