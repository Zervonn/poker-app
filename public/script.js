// =======================
// 📌 DOM Element Selection
// =======================
const revealButton = document.getElementById("reveal-button");
const resetButton = document.getElementById("reset-button");
const nextRoundButton = document.getElementById("next-round-button");
const sessionInfo = document.getElementById("session-info");
const resultsContainer = document.getElementById("vote-results");
const userListContainer = document.getElementById("user-list");
const historyContainer = document.getElementById("vote-history");
const roleInfo = document.getElementById("user-role-info");
const themeToggle = document.getElementById("theme-toggle");
const note = document.getElementById("facilitator-note");
const userLabel = document.getElementById("user-label");
const cards = document.querySelectorAll(".card");

const isFacilitator = role === "facilitator";

// =======================
// 🌗 Theme Setup
// =======================
const currentTheme = localStorage.getItem("theme");
if (currentTheme === "dark") {
  document.body.classList.add("dark");
}
themeToggle.addEventListener("click", () => {
  document.body.classList.toggle("dark");
  localStorage.setItem("theme", document.body.classList.contains("dark") ? "dark" : "light");
});

// =======================
// 🧱 UI Initialization
// =======================
if (sessionInfo) sessionInfo.textContent = `${username} joined room: ${roomId}`;
if (roleInfo) roleInfo.textContent = `Your role: ${role}`;
if (userLabel) userLabel.textContent = `Logged in as: ${username}`;

if (!isFacilitator) {
  revealButton?.remove();
  resetButton?.remove();
  nextRoundButton?.remove();
  if (note) note.textContent = "Waiting for facilitator to reveal or reset votes.";
}

// =======================
// 🔌 Connect to Server
// =======================
const socket = io();
socket.emit("join-room", { roomId, username, role });

// =======================
// 🎴 Card Selection Logic
// =======================
if (role !== "observer") {
  cards.forEach(card => {
    card.addEventListener("click", () => {
      cards.forEach(c => c.classList.remove("selected"));
      card.classList.add("selected");
      socket.emit("cast-vote", {
        roomId,
        username,
        vote: card.textContent,
      });
    });
  });
} else {
  cards.forEach(card => {
    card.style.opacity = "0.6";
    card.style.cursor = "not-allowed";
  });
}

// =======================
// 🔘 Facilitator Controls
// =======================
let shouldReveal = false;
let currentVotes = {};

revealButton?.addEventListener("click", () => {
  shouldReveal = true;
  socket.emit("request-votes", roomId);
});

resetButton?.addEventListener("click", () => {
  shouldReveal = false;
  socket.emit("reset-room", roomId);
});

nextRoundButton?.addEventListener("click", () => {
  shouldReveal = false;
  socket.emit("next-round", roomId);
});

// =======================
// 📥 Socket Events
// =======================
socket.on("vote-update", (voteData) => {
  currentVotes = voteData;
  if (!shouldReveal) {
    resultsContainer.innerHTML = "";
    updateUserList();
    return;
  }

  resultsContainer.innerHTML = "";
  for (let user in voteData) {
    const card = document.createElement("div");
    card.className = "vote-card";
    card.innerHTML = `
      <div class="card-inner flipped">
        <div class="card-front">
          <span>👤 ${user}</span>
        </div>
        <div class="card-back">
          <div class="vote-value">${voteData[user]}</div>
        </div>
      </div>
    `;
    resultsContainer.appendChild(card);
  }

  updateUserList();
});

socket.on("user-list", (users) => {
  window.currentUsers = users;
  updateUserList();
});

socket.on("voting-status", ({ allHaveVoted }) => {
  if (revealButton) {
    revealButton.disabled = !allHaveVoted;
    revealButton.style.opacity = allHaveVoted ? "1" : "0.5";
  }
});

socket.on("vote-history", (historyData) => {
  historyContainer.innerHTML = "";
  historyData.forEach((round, index) => {
    const roundDiv = document.createElement("div");
    roundDiv.className = "round";
    roundDiv.innerHTML = `<strong>Round ${index + 1}</strong>`;
    for (let user in round) {
      const entry = document.createElement("div");
      entry.textContent = `${user}: ${round[user]}`;
      roundDiv.appendChild(entry);
    }
    historyContainer.appendChild(roundDiv);
  });
});

// =======================
// 👥 Update User Sidebar
// =======================
function updateUserList() {
  if (!window.currentUsers) return;

  userListContainer.innerHTML = window.currentUsers.map(user => {
    const voted = currentVotes[user.username] !== undefined;
    const status = voted ? "🟢 Selected" : "⚪ Not Yet";

    const roleIcon = {
      facilitator: "⭐",
      developer: "💻",
      qa: "🧪",
      observer: "👀"
    }[user.role] || "👤";

    return `
      <div class="user-entry">
        ${roleIcon} <strong>${user.username}</strong>
        <span class="role">(${user.role})</span>
        <span class="vote-status">${status}</span>
        ${isFacilitator && user.username !== username ? `
          <button onclick="removeUser('${user.username}')">❌</button>
        ` : ""}
      </div>
    `;
  }).join("");
}

// =======================
// ❌ Remove User (Facilitator Only)
// =======================
function removeUser(targetUsername) {
  if (confirm(`Remove ${targetUsername} from the room?`)) {
    socket.emit("remove-user", { roomId, targetUsername });
  }
}
