
document.addEventListener('DOMContentLoaded', function () {
  const loginForm = document.getElementById('loginForm');
  loginForm.addEventListener('submit', (event) => {
    event.preventDefault();  // 防止表单默认提交行为
    const playerName = document.getElementById('playerName').value;
    const socket = io({ autoConnect: false });

    socket.auth = { playerName }
    socket.connect()

    socket.on('session',({sessionID, playerId,playerName})=> {
      localStorage.setItem("sessionID",sessionID)
      localStorage.setItem("playerId",playerId)
      localStorage.setItem("playerName",playerName)
      window.location.href = '/lobby.html'
    })
  });
})