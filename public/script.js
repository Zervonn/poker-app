// =======================
// 📌 DOM Element Selection
// =======================
const params = new URLSearchParams(window.location.search);
const username = params.get("user");
const role = params.get("role");
const roomId = window.location.pathname.split("/room/")[1];

const revealButton = document.getElementById("reveal-button");
const resetButton = document.getElementById("reset-button");
const sessionInfo = document.getElementById("session-info");
const resultsContainer = document.getElementById("vote-results");
const userListContainer = document.getElementById("user-list");
const cards = document.querySelectorAll(".card");

const roleInfo = document.getElementById("user-role-info");
if (roleInfo) {
  roleInfo.textContent = `Your role: ${role}`;
}
// =======================
// 🧱 Initial State
// =======================
let shouldReveal = false;

revealButton.disabled = true;
revealButton.style.opacity = "0.5";

if (sessionInfo) {
  sessionInfo.textContent = `${username} joined room: ${roomId}`;
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
  // Only allow Dev, QA, Facilitator to vote
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
  // Optional: visually disable the cards
  cards.forEach(card => {
    card.style.opacity = "0.6";
    card.style.cursor = "not-allowed";
  });
}

// =======================
// 🔁 Reveal Button Logic
// =======================
revealButton.addEventListener("click", () => {
  console.log("🟢 Reveal button clicked!");
  shouldReveal = true;
  socket.emit("request-votes", roomId);
});

// =======================
// 🔄 Reset Button Logic
// =======================
resetButton.addEventListener("click", () => {
  shouldReveal = false;
  socket.emit("reset-room", roomId);
});

// =======================
// 📥 Server Events
// =======================

// Vote updates
socket.on("vote-update", (voteData) => {
  console.log("🟢 vote-update received:", voteData);

  if (!shouldReveal) {
    resultsContainer.innerHTML = "";
    return;
  }

  resultsContainer.innerHTML = "";

  for (let user in voteData) {
    const card = document.createElement("div");
    card.className = "vote-card";
    card.innerHTML = `
      <div class="card-inner">
        <div class="card-front">
          <span>👤 ${user}</span>
        </div>
        <div class="card-back">
          <div class="vote-value">${voteData[user]}</div>
        </div>
      </div>
    `;
    setTimeout(() => card.querySelector('.card-inner').classList.add('flipped'), 100);

    resultsContainer.appendChild(card);
  }
});

// Live user list
socket.on("user-list", (usernames) => {
  userListContainer.innerHTML = `<strong>Users in room:</strong><br/>` +
    usernames.map(name => `👤 ${name}`).join("<br>");
});

// Voting status
socket.on("voting-status", ({ allHaveVoted }) => {
  console.log("🧾 Voting status:", allHaveVoted);

  if (allHaveVoted) {
    revealButton.disabled = false;
    revealButton.style.opacity = "1";
  } else {
    revealButton.disabled = true;
    revealButton.style.opacity = "0.5";
  }
});
const historyContainer = document.getElementById("vote-history");

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
const nextRoundButton = document.getElementById("next-round-button");

nextRoundButton.addEventListener("click", () => {
  shouldReveal = false;
  socket.emit("next-round", roomId);
});