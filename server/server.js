const express = require("express");
const mongoose = require("mongoose");
const cors = require("cors");
const dotenv = require("dotenv");
const http = require("http");
const { Server } = require("socket.io");
const path = require("path");
const GroupMessage = require("./models/GroupMessage");
const PrivateMessage = require("./models/PrivateMessage");

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

  // join room
  socket.on("joinRoom", async (data) => {
    socket.join(data.room);

    console.log(`${data.username} joined room: ${data.room}`);

    // send system message
    io.to(data.room).emit("roomMessage", {
      message: `${data.username} joined the room`,
      room: data.room
    });

    // load chat history from DB
    const history = await GroupMessage.find({ room: data.room })
      .sort({ date_sent: 1 })
      .limit(50);

    socket.emit("roomHistory", history);
  });

  // leave room
  socket.on("leaveRoom", (data) => {
    socket.leave(data.room);

    console.log(`${data.username} left room: ${data.room}`);

    io.to(data.room).emit("roomMessage", {
      message: `${data.username} left the room`,
      room: data.room
    });
  });

  // group message
  socket.on("groupMessage", async (data) => {
    try {
      const newMessage = new GroupMessage({
        from_user: data.from_user,
        room: data.room,
        message: data.message
      });

      const savedMessage = await newMessage.save();

      io.to(data.room).emit("newGroupMessage", savedMessage);
    } catch (err) {
      console.log("Group message error:", err);
    }
  });

  // private message (store in DB)
  socket.on("privateMessage", async (data) => {
    try {
      const newPrivate = new PrivateMessage({
        from_user: data.from_user,
        to_user: data.to_user,
        message: data.message
      });

      const savedPrivate = await newPrivate.save();

      socket.emit("newPrivateMessage", savedPrivate);
      socket.to(data.to_user).emit("newPrivateMessage", savedPrivate);
    } catch (err) {
      console.log("Private message error:", err);
    }
  });

  // typing indicator (private chat)
  socket.on("typing", (data) => {
    socket.to(data.to_user).emit("typing", {
      from_user: data.from_user
    });
  });

  socket.on("stopTyping", (data) => {
    socket.to(data.to_user).emit("stopTyping", {
      from_user: data.from_user
    });
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