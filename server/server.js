const express = require("express");
const mongoose = require("mongoose");
const cors = require("cors");
const dotenv = require("dotenv");
const http = require("http");
const { Server } = require("socket.io");
const path = require("path");

dotenv.config();

const app = express();
const server = http.createServer(app);
const io = new Server(server);

// middleware
app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// serve static files
app.use(express.static(path.join(__dirname, "public")));

// routes (API)
const authRoutes = require("./routes/auth");
app.use("/api/auth", authRoutes);

// routes (Pages)
app.get("/", (req, res) => {
  res.sendFile(path.join(__dirname, "view", "login.html"));
});

app.get("/login", (req, res) => {
  res.sendFile(path.join(__dirname, "view", "login.html"));
});

app.get("/signup", (req, res) => {
  res.sendFile(path.join(__dirname, "view", "signup.html"));
});

app.get("/chat", (req, res) => {
  res.sendFile(path.join(__dirname, "view", "chat.html"));
});

// MongoDB connection
mongoose
  .connect(process.env.MONGO_URI)
  .then(() => {
    console.log("Connected to MongoDB Atlas");
  })
  .catch((err) => {
    console.log("MongoDB connection error:", err);
  });

// Socket.io logic
io.on("connection", (socket) => {
  console.log("User connected:", socket.id);

  socket.on("joinRoom", (data) => {
    socket.join(data.room);

    io.to(data.room).emit("roomMessage", {
      message: `${data.username} joined the room`,
      room: data.room,
    });

    console.log(`${data.username} joined room: ${data.room}`);
  });

  socket.on("leaveRoom", (data) => {
    socket.leave(data.room);

    io.to(data.room).emit("roomMessage", {
      message: `${data.username} left the room`,
      room: data.room,
    });

    console.log(`${data.username} left room: ${data.room}`);
  });

  socket.on("disconnect", () => {
    console.log("User disconnected:", socket.id);
  });
});

// start server
const PORT = process.env.PORT || 3000;

server.listen(PORT, () => {
  console.log(`Server running at http://localhost:${PORT}`);
});