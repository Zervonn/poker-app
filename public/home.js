const button = document.getElementById("start-session");

button.addEventListener("click", () => {
  const username = prompt("Enter your name:");

  if (!username) return alert("Name is required to start!");

  // Generate a fake room ID (e.g. 6-char random string)
  const roomId = Math.random().toString(36).substring(2, 8);

  // Redirect to room.html with query params
  window.location.href = `/room/${roomId}?user=${encodeURIComponent(username)}`;

});
