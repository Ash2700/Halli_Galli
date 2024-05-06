
// app.js
const playerId = getCookie('playerId')
const playerName = getCookie('playerName')

document.getElementById('show-id').innerHTML = playerId
document.getElementById('show-name').innerHTML = playerName


function getCookie(name) {
  const value = `; ${document.cookie}`;
  const parts = value.split(`; ${name}=`);
  if (parts.length === 2) return parts.pop().split(';').shift();
}

document.addEventListener('DOMContentLoaded', function () {
  
  const socket = io('http://localhost:3000');

  // socket 建立
  socket.on('connect', () => {
    console.log('Connected to server');
  });
  
  socket.on('message', (data) => {
    console.log('Message from server:', data);
  });
  socket.emit('callRooms',() => {
    console.log('give Rooms')
  })
  // 送加入房間
  document.getElementById('joinRoom').addEventListener('click', () => {
    const roomId = selectedRoomId;
    socket.emit('joinRoom', { roomId, playerId });
  });
  
  socket.on('joinRoomResponse',(response)=>{
    if(response.success){
      window.location.href = `/gameRoom.html?roomId=${response.roomId}`
    }
  })
  
  const createRoomButton = document.getElementById('createRoom');
  const newRoomNameInput = document.getElementById('newRoomName');
  createRoomButton.addEventListener('click', () => {
    const name = newRoomNameInput.value;
    socket.emit('createRoom', { name, hostId:playerId });
  });
  
  const roomsContainer = document.getElementById('rooms');
  let selectedRoomId = null;
  socket.on('updateRooms', (rooms) => {
    roomsContainer.innerHTML = '';
    rooms.forEach(room => {
      const roomDiv = document.createElement('div');
      roomDiv.textContent = `Room ${room.name} (${room.players.length}/6 players)`;
      roomDiv.dataset.roomId = room.id;
      roomDiv.onclick = () => {
        document.querySelectorAll('#rooms div').forEach(div =>{
          div.classList.remove('selected');
        })
        roomDiv.classList.add('selected');
        selectedRoomId = room.id
      };
      roomsContainer.appendChild(roomDiv);
    });
  });
  const leaveLobbyButton = document.getElementById('leaveLobby');
  leaveLobbyButton.addEventListener('click', () => {
    window.location.href = '/'; // 或其他適合的行為
  });
});


