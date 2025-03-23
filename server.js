// =======================
// 🛠️ Server Setup
// =======================

// Import necessary packages
const express = require("express");
const http = require("http");
const { Server } = require("socket.io");
const path = require("path");

// Initialize app, HTTP server, and attach Socket.IO
const app = express();
const server = http.createServer(app);
const io = new Server(server);

// Set server port (default to 3000 if not specified)
const PORT = process.env.PORT || 3000;

// Enable EJS view engine
app.set("view engine", "ejs");

// Serve static assets (CSS, JS) and parse JSON bodies
app.use(express.static(path.join(__dirname, "public")));
app.use(express.json());

// =======================
// 🌐 Express Routes
// =======================

// Home/lobby page
app.get("/", (req, res) => {
  res.render("index");
});

// Room page — user and role passed in query string
app.get("/room/:roomId", (req, res) => {
  const { user, role } = req.query;
  res.render("room", { roomId: req.params.roomId, user, role });
});

// =======================
// 🧠 In-Memory State
// =======================

const votes = {};             // { roomId: { username: vote } }
const history = {};           // { roomId: [ { round1Votes }, { round2Votes }, ... ] }
const usersInRooms = {};      // { roomId: Map(username -> { username, role, socketId }) }

// =======================
// 🔌 Socket.IO Real-Time Events
// =======================
io.on("connection", (socket) => {
  console.log("🟢 New user connected");

  // ---- Join Room ----
  socket.on("join-room", ({ roomId, username, role }) => {
    socket.join(roomId);
    socket.username = username;
    socket.roomId = roomId;
    socket.role = role;

    // Add to room user list
    if (!usersInRooms[roomId]) usersInRooms[roomId] = new Map();
    usersInRooms[roomId].set(username, {
      username,
      role,
      socketId: socket.id,
    });

    emitUserList(roomId);
    console.log(`👤 ${username} (${role}) joined room ${roomId}`);
  });

  // ---- Vote Handling ----
  socket.on("cast-vote", ({ roomId, username, vote }) => {
    if (!votes[roomId]) votes[roomId] = {};
    votes[roomId][username] = vote;

    io.to(roomId).emit("vote-update", votes[roomId]);

    // Check if all users have voted
    const allUsers = usersInRooms[roomId] || new Map();
    const votedUsers = Object.keys(votes[roomId]);
    const allHaveVoted = allUsers.size > 0 && votedUsers.length === allUsers.size;

    io.to(roomId).emit("voting-status", { allHaveVoted });
  });

  // ---- Reset Current Vote ----
  socket.on("reset-room", (roomId) => {
    votes[roomId] = {};
    io.to(roomId).emit("vote-update", {});
    io.to(roomId).emit("vote-history", history[roomId] || []);
    console.log(`🔁 Room ${roomId} votes reset`);
  });

  // ---- Start Next Round ----
  socket.on("next-round", (roomId) => {
    if (!history[roomId]) history[roomId] = [];

    if (votes[roomId] && Object.keys(votes[roomId]).length > 0) {
      history[roomId].push({ ...votes[roomId] }); // Save current round
    }

    votes[roomId] = {}; // Clear current votes

    io.to(roomId).emit("vote-update", {});
    io.to(roomId).emit("vote-history", history[roomId]);

    console.log(`➡️ New round started in room ${roomId}`);
  });

  // ---- Request Vote Reveal ----
  socket.on("request-votes", (roomId) => {
    socket.to(roomId).emit("vote-update", votes[roomId] || {});
    socket.emit("vote-update", votes[roomId] || {});
  });

  // ---- Facilitator: Remove a User ----
  socket.on("remove-user", ({ roomId, targetUsername }) => {
    const userMap = usersInRooms[roomId];
    if (userMap && userMap.has(targetUsername)) {
      const target = userMap.get(targetUsername);
      const targetSocket = io.sockets.sockets.get(target.socketId);

      if (targetSocket) {
        targetSocket.disconnect(true); // Force disconnect
      }

      userMap.delete(targetUsername);
      emitUserList(roomId);
      console.log(`❌ ${targetUsername} removed from room ${roomId}`);
    }
  });

  // ---- Handle Disconnect ----
  socket.on("disconnect", () => {
    const { username, roomId } = socket;
    if (roomId && usersInRooms[roomId]) {
      usersInRooms[roomId].delete(username);
      emitUserList(roomId);
      console.log(`🔴 ${username} left room ${roomId}`);
    }
  });
});

// Broadcast updated user list to all clients in room
function emitUserList(roomId) {
  const userMap = usersInRooms[roomId];
  if (!userMap) return;
  const userList = Array.from(userMap.values());
  io.to(roomId).emit("user-list", userList);
}

// =======================
// 🚀 Start Server
// =======================
server.listen(PORT, () => {
  console.log(`🚀 Server running at http://localhost:${PORT}`);
});
