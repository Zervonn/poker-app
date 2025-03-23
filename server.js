// =======================
// Imports & Setup
// =======================

const express = require("express");
const http = require("http");
const { Server } = require("socket.io");
const path = require("path");

const app = express();
const server = http.createServer(app);         // Create an HTTP server using Express
const io = new Server(server);                 // Attach Socket.IO to the server

const PORT = process.env.PORT || 3000;         // Use environment port or default to 3000

// =======================
// Middleware
// =======================

app.use(express.static(path.join(__dirname, "public"))); // Serve static assets from /public
app.use(express.json()); // Parse incoming JSON bodies

// =======================
// Routes
// =======================

// Homepage (lobby/index.html)
app.get("/", (req, res) => {
  res.sendFile(path.join(__dirname, "public", "index.html"));
});

// Room page (room.html)
app.get("/room/:roomId", (req, res) => {
  res.sendFile(path.join(__dirname, "public", "room.html"));
});

// =======================
// In-Memory Stores
// =======================

const votes = {};         // Tracks current votes per room: { roomId: { username: vote } }
const history = {};       // Tracks previous rounds per room: { roomId: [ { username: vote, ... } ] }
const usersInRooms = {};  // Tracks who is in each room: { roomId: Set(username) }

// =======================
// Socket.IO Real-Time Events
// =======================

io.on("connection", (socket) => {
  console.log("🟢 A user connected");

  // --------------------
  // Join Room
  // --------------------
  socket.on("join-room", ({ roomId, username }) => {
    socket.join(roomId); // Join socket.io room
    socket.username = username;
    socket.roomId = roomId;

    // Track user in the room
    if (!usersInRooms[roomId]) {
      usersInRooms[roomId] = new Set();
    }
    usersInRooms[roomId].add(username);

    // Broadcast updated user list to all clients in room
    io.to(roomId).emit("user-list", Array.from(usersInRooms[roomId]));
    console.log(`👤 ${username} joined room ${roomId}`);
  });

  // --------------------
  // Vote Casting
  // --------------------
  socket.on("cast-vote", ({ roomId, username, vote }) => {
    if (!votes[roomId]) votes[roomId] = {};
    votes[roomId][username] = vote;

    // Broadcast current votes to room
    io.to(roomId).emit("vote-update", votes[roomId]);

    // Check if all users have voted
    const allUsers = usersInRooms[roomId] || new Set();
    const votedUsers = Object.keys(votes[roomId]);
    const allHaveVoted = allUsers.size > 0 && votedUsers.length === allUsers.size;

    // Notify clients if everyone has voted
    io.to(roomId).emit("voting-status", { allHaveVoted });
  });

  // --------------------
  // Reset Vote (Clear without saving)
  // --------------------
  socket.on("reset-room", (roomId) => {
    votes[roomId] = {}; // Just clear current votes

    // Notify clients
    io.to(roomId).emit("vote-update", {});
    console.log(`🧹 Votes cleared for room ${roomId}`);
  });

  // --------------------
  // Next Round (Save current round, then reset)
  // --------------------
  socket.on("next-round", (roomId) => {
    // Save round to history
    if (!history[roomId]) history[roomId] = [];
    if (votes[roomId] && Object.keys(votes[roomId]).length > 0) {
      history[roomId].push({ ...votes[roomId] });
    }

    // Clear current votes
    votes[roomId] = {};

    // Notify clients
    io.to(roomId).emit("vote-update", {});
    io.to(roomId).emit("vote-history", history[roomId]);
    console.log(`➡️ Next vote started for room ${roomId}`);
  });

  // --------------------
  // Request Current Votes (usually triggered on reveal)
  // --------------------
  socket.on("request-votes", (roomId) => {
    socket.to(roomId).emit("vote-update", votes[roomId] || {});
    socket.emit("vote-update", votes[roomId] || {});
  });

  // --------------------
  // Disconnect / Leave Room
  // --------------------
  socket.on("disconnect", () => {
    const { username, roomId } = socket;

    if (roomId && usersInRooms[roomId]) {
      usersInRooms[roomId].delete(username);

      // Update user list in room
      io.to(roomId).emit("user-list", Array.from(usersInRooms[roomId]));
      console.log(`🔴 ${username} left room ${roomId}`);
    }
  });
});

// =======================
// Start the Server
// =======================
server.listen(PORT, () => {
  console.log(`🚀 Server running at http://localhost:${PORT}`);
});
