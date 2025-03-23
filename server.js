// =======================
// Imports & Setup
// =======================

const express = require("express");
const http = require("http");
const { Server } = require("socket.io");
const path = require("path");

const app = express();
const server = http.createServer(app);        // Create HTTP server
const io = new Server(server);                // Attach Socket.IO

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
// In-Memory Stores
// =======================

const votes = {};         // Current votes: { roomId: { username: vote } }
const history = {};       // Vote history: { roomId: [ { username: vote, ... } ] }
const usersInRooms = {};  // Users: { roomId: { username: { role, isFacilitator } } }

// =======================
// Socket.IO Events
// =======================

io.on("connection", (socket) => {
  console.log("🟢 A user connected");

  // --------------------
  // Join Room
  // --------------------
  socket.on("join-room", ({ roomId, username, role }) => {
    socket.join(roomId);
    socket.username = username;
    socket.roomId = roomId;
    socket.role = role;

    // Init user store for the room if not already set
    if (!usersInRooms[roomId]) {
      usersInRooms[roomId] = {};
    }

    // First person to join becomes facilitator unless role was explicitly chosen
    const isFirstUser = Object.keys(usersInRooms[roomId]).length === 0;
    const isFacilitator = isFirstUser || role === "facilitator";

    // Save user with metadata
    usersInRooms[roomId][username] = {
      role,
      isFacilitator,
    };

    // Emit updated user list
    const userList = Object.entries(usersInRooms[roomId]).map(([name, info]) => ({
      username: name,
      role: info.role,
      isFacilitator: info.isFacilitator,
    }));

    io.to(roomId).emit("user-list", userList);
    console.log(`👤 ${username} (${role}) joined room ${roomId}`);
  });

  // --------------------
  // Cast Vote
  // --------------------
  socket.on("cast-vote", ({ roomId, username, vote }) => {
    if (!votes[roomId]) votes[roomId] = {};
    votes[roomId][username] = vote;

    // Broadcast current vote state
    io.to(roomId).emit("vote-update", votes[roomId]);

    // Check if all users (excluding observers) have voted
    const users = usersInRooms[roomId] || {};
    const eligibleVoters = Object.entries(users).filter(
      ([, info]) => info.role !== "observer"
    );
    const votedUsers = Object.keys(votes[roomId]);

    const allHaveVoted = eligibleVoters.length > 0 &&
      eligibleVoters.every(([name]) => votedUsers.includes(name));

    io.to(roomId).emit("voting-status", { allHaveVoted });
  });

  // --------------------
  // Reset Votes (No Save)
  // --------------------
  socket.on("reset-room", (roomId) => {
    votes[roomId] = {};
    io.to(roomId).emit("vote-update", {});
    console.log(`🧹 Votes cleared for room ${roomId}`);
  });

  // --------------------
  // Next Round (Save + Reset)
  // --------------------
  socket.on("next-round", (roomId) => {
    if (!history[roomId]) history[roomId] = [];

    if (votes[roomId] && Object.keys(votes[roomId]).length > 0) {
      history[roomId].push({ ...votes[roomId] });
    }

    votes[roomId] = {};
    io.to(roomId).emit("vote-update", {});
    io.to(roomId).emit("vote-history", history[roomId]);

    console.log(`➡️ Next round started in room ${roomId}`);
  });

  // --------------------
  // Request Votes (for Reveal)
  // --------------------
  socket.on("request-votes", (roomId) => {
    socket.emit("vote-update", votes[roomId] || {});
    socket.to(roomId).emit("vote-update", votes[roomId] || {});
  });

  // --------------------
  // Disconnect Handler
  // --------------------
  socket.on("disconnect", () => {
    const { username, roomId } = socket;

    if (roomId && usersInRooms[roomId]) {
      delete usersInRooms[roomId][username];

      // Re-broadcast updated user list
      const userList = Object.entries(usersInRooms[roomId]).map(([name, info]) => ({
        username: name,
        role: info.role,
        isFacilitator: info.isFacilitator,
      }));

      io.to(roomId).emit("user-list", userList);
      console.log(`🔴 ${username} disconnected from room ${roomId}`);
    }
  });
});

// =======================
// Start Server
// =======================
server.listen(PORT, () => {
  console.log(`🚀 Server running at http://localhost:${PORT}`);
});
