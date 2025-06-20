const express = require("express");
const path = require('path');
const cors = require("cors");
const dotenv = require("dotenv");
const connectDB = require("./config/db");
const http = require("http");                  // NEW: create server
const { Server } = require("socket.io");       // NEW: import socket.io

// Init app
dotenv.config();
connectDB();
const app = express();

// Middleware
app.use(cors({
  origin: "http://localhost:5173",
  credentials: true
}));
app.use(express.json());

// Routes
app.use("/api/auth", require("./routes/authRoutes"));
app.use("/api/complaints", require("./routes/complaintRoutes"));
app.use('/uploads', express.static(path.join(__dirname, 'uploads')));



// Server & Socket Setup
const server = http.createServer(app);         // NEW: wrap express in HTTP server
const io = new Server(server, {
  cors: {
    origin: "*",                               // adjust if you have frontend URL
    methods: ["GET", "POST", "PUT"]
  }
});

// Store io globally in app to access in controllers
app.set("io", io);

// Handle socket connections
io.on("connection", (socket) => {
  console.log("🟢 Socket connected:", socket.id);

  socket.on("disconnect", () => {
    console.log("🔴 Socket disconnected:", socket.id);
  });
});

// Start server
const PORT = process.env.PORT || 5000;
server.listen(PORT, () => {
  console.log(`🚀 Server running on http://localhost:${PORT}`);
});
