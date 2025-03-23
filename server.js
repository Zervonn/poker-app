const express = require("express");
const http = require("http");
const { Server } = require("socket.io");
const path = require("path");

const app = express();
const server = http.createServer(app);         // Create HTTP server
const io = new Server(server);                 // Attach Socket.IO

const PORT = process.env.PORT || 3000;

// =======================
// Middleware
// =======================
app.use(express.static(path.join(__dirname, "public"))); // Serve static files
app.use(express.json()); // Support JSON bodies

// =======================
// Routes
// =======================
app.get("/", (req, res) => {
  res.sendFile(path.join(__dirname, "public", "index.html"));
});

app.get("/room/:roomId", (req, res) => {
  res.sendFile(path.join(__dirname, "public", "room.html"));
});

// =======================
// In-Memory Vote Store
// =======================
const votes = {}; // Format: { roomId: { username: vote } }

// =======================
// Socket.IO Events
// =======================
const usersInRooms = {}; // { roomId: Set([user1, user2]) }


io.on("connection", (socket) => {
  console.log("🟢 A user connected");

  socket.on("join-room", ({ roomId, username }) => {
    socket.join(roomId);
    socket.username = username;
    socket.roomId = roomId;
  
    // Track users
    if (!usersInRooms[roomId]) {
      usersInRooms[roomId] = new Set();
    }
    usersInRooms[roomId].add(username);
  
    // Send updated user list to room
    io.to(roomId).emit("user-list", Array.from(usersInRooms[roomId]));
  
    console.log(`👤 ${username} joined room ${roomId}`);
  });
  

  socket.on("cast-vote", ({ roomId, username, vote }) => {
    if (!votes[roomId]) votes[roomId] = {};
    votes[roomId][username] = vote;
  
    // Broadcast current vote state
    io.to(roomId).emit("vote-update", votes[roomId]);
  
    // Check if all users have voted
    const allUsers = usersInRooms[roomId] || new Set();
    const votedUsers = Object.keys(votes[roomId]);
  
    const allHaveVoted = allUsers.size > 0 && votedUsers.length === allUsers.size;
    io.to(roomId).emit("voting-status", { allHaveVoted });
  });

  socket.on("reset-room", (roomId) => {
    votes[roomId] = {};
    io.to(roomId).emit("vote-update", {});
    console.log(`🔄 Votes reset for room ${roomId}`);
  });
  socket.on("request-votes", (roomId) => {
    socket.to(roomId).emit("vote-update", votes[roomId] || {});
    socket.emit("vote-update", votes[roomId] || {});
  });
  
  
  socket.on("disconnect", () => {
    const { username, roomId } = socket;
    if (roomId && usersInRooms[roomId]) {
      usersInRooms[roomId].delete(username);
      io.to(roomId).emit("user-list", Array.from(usersInRooms[roomId]));
      console.log(`🔴 ${username} left room ${roomId}`);
    }
  });
  
});

// =======================
// Start Server
// =======================
server.listen(PORT, () => {
  console.log(`🚀 Server running at http://localhost:${PORT}`);
});
