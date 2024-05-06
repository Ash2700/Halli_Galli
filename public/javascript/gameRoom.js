const playerId = getCookie('playerId')
const playerName = getCookie('playerName')

document.getElementById('show-id').innerHTML = playerId
document.getElementById('show-name').innerHTML = playerName
function getCookie(name) {
  const value = `; ${document.cookie}`;
  const parts = value.split(`; ${name}=`);
  if (parts.length === 2) return parts.pop().split(';').shift();
}

document.addEventListener('DOMContentLoaded',()=>{
  const socket = io()
  
  // 玩家準備好
  document.getElementById('ready-button').addEventListener('click',()=>{
    const urlParams = new URLSearchParams(window.location.search)
    const roomId = urlParams.get('roomId')
    console.log(roomId)
    socket.emit('playerReady', {playerId,roomId})
  })

})