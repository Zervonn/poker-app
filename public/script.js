// Read room info from URL
const params = new URLSearchParams(window.location.search);
const username = params.get("user");
const roomId = window.location.pathname.split("/room/")[1];

// Connect to Socket.IO and join the room
const socket = io();
socket.emit("join-room", { roomId, username });

// Show session info
const sessionInfo = document.getElementById("session-info");
if (sessionInfo) {
  sessionInfo.textContent = `${username} joined room: ${roomId}`;
}

// Track card selection
const cards = document.querySelectorAll(".card");
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

// Reveal logic
let shouldReveal = false;
const revealButton = document.getElementById("reveal-button");

revealButton.addEventListener("click", () => {
  console.log("🟢 Reveal button clicked!");
  shouldReveal = true;
  socket.emit("request-votes", roomId);
});

// Reset logic
const resetButton = document.getElementById("reset-button");
resetButton.addEventListener("click", () => {
  shouldReveal = false;
  socket.emit("reset-room", roomId);
});

// Listen for server vote updates
const resultsContainer = document.getElementById("vote-results");

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
      <div style="font-size: 16px; margin-bottom: 5px;">${user}</div>
      <div>${voteData[user]}</div>
    `;
    resultsContainer.appendChild(card);
  }
});
