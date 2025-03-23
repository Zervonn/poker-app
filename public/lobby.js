// =======================
// 🎯 Lobby Page Logic
// =======================
const createBtn = document.getElementById("create-room");
const joinForm = document.getElementById("lobby-form");
const usernameInput = document.getElementById("username");
const roomIdInput = document.getElementById("room-id");
const roleSelect = document.getElementById("role");
const themeToggle = document.getElementById("theme-toggle");
const userLabel = document.getElementById("user-label");

// =======================
// 🌗 Theme Setup
// =======================
const currentTheme = localStorage.getItem("theme");
if (currentTheme === "dark") {
  document.body.classList.add("dark");
}
themeToggle.addEventListener("click", () => {
  document.body.classList.toggle("dark");
  const isDark = document.body.classList.contains("dark");
  localStorage.setItem("theme", isDark ? "dark" : "light");
});

// =======================
// 🧭 Room ID Generator
// =======================
function generateRoomId() {
  return Math.random().toString(36).substring(2, 8);
}

// =======================
// 🆕 Create Room
// =======================
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

// =======================
// 🔁 Join Room
// =======================
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
