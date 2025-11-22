import express from "express"; //importing only because of express.json
import { ENV } from "./utils/Env.js";
import cookieParser from "cookie-parser";
import cors from "cors";
import { connectDB } from "./utils/db.js";
import authRoutes from "./routes/auth.route.js";
import messageRoutes from "./routes/message.route.js";
import { app, server } from "./utils/socket.js";
import path from "path";

const port = process.env.PORT || ENV.PORT || 3000;
const __dirname = path.resolve();

//Public middlewares
if (ENV.NODE_ENV !== "production") {
  app.use(
    cors({
      origin: "http://localhost:5173",
      credentials: true,
    })
  );
}

app.use(express.json({ limit: "10mb" })); //req.body
app.use(cookieParser({ limit: "10mb" }));

app.use("/api/auth", authRoutes);
app.use("/api/message", messageRoutes);

// app.get("/", (req, res) => {
//   res.send("First Api is here...");
// });

//Deploy
if (ENV.NODE_ENV === "production") {
  app.use(express.static(path.join(__dirname, "../frontend/dist")));

  app.get("*", (req, res) => {
    res.sendFile(path.join(__dirname, "../frontent", "dist", "index.html"));
  });
}

//Database connection
connectDB()
  .then(() => {
    server.listen(port, () => {
      console.log(`Server is running on port: http://localhost:${port}`);
    });
  })
  .catch((error) => {
    console.log("Api listen/connection failed");
  });
