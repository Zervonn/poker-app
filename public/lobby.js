document.getElementById("create-room").addEventListener("click", () => {
    const username = document.getElementById("username").value.trim();
    if (!username) return alert("Please enter a name.");
  
    const roomId = generateRoomId();
    window.location.href = `/room/${roomId}?user=${encodeURIComponent(username)}`;
  });
  
  document.getElementById("lobby-form").addEventListener("submit", (e) => {
    e.preventDefault();
  
    const username = document.getElementById("username").value.trim();
    const roomId = document.getElementById("room-id").value.trim();
    if (!username || !roomId) return alert("Please enter both name and room ID.");
  
    window.location.href = `/room/${roomId}?user=${encodeURIComponent(username)}`;
  });
  
  function generateRoomId() {
    return Math.random().toString(36).substring(2, 8); // e.g. "k3l9vx"
  }
  