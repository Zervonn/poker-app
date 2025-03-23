// 🔍 Grab DOM elements
const createBtn = document.getElementById("create-room");
const joinForm = document.getElementById("lobby-form");
const usernameInput = document.getElementById("username");
const roomIdInput = document.getElementById("room-id");
const roleSelect = document.getElementById("role");

// 🆕 Handle Create Room
createBtn.addEventListener("click", () => {
  const username = usernameInput.value.trim();
  const role = roleSelect.value;

  if (!username || !role) {
    alert("Please enter your name and select a role.");
    return;
  }

  const roomId = generateRoomId();
  const query = `?user=${encodeURIComponent(username)}&role=${encodeURIComponent(role)}`;
  window.location.href = `/room/${roomId}${query}`;
});

// 🔄 Handle Join Room
joinForm.addEventListener("submit", (e) => {
  e.preventDefault();

  const username = usernameInput.value.trim();
  const role = roleSelect.value;
  const roomId = roomIdInput.value.trim();

  if (!username || !role || !roomId) {
    alert("Please enter your name, select a role, and enter a room ID.");
    return;
  }

  const query = `?user=${encodeURIComponent(username)}&role=${encodeURIComponent(role)}`;
  window.location.href = `/room/${roomId}${query}`;
});

// 🔐 Room ID generator for "Create Room"
function generateRoomId() {
  return Math.random().toString(36).substring(2, 8); // e.g. "k3l9vx"
}
