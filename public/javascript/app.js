// app.js
document.addEventListener('DOMContentLoaded', function () {
  const socket = io('http://localhost:3000');

  // socket 建立
  socket.on('connect', () => {
    console.log('Connected to server');
  });
  
  socket.on('message', (data) => {
    console.log('Message from server:', data);
  });

  // document.getElementById('joinRoom').addEventListener('click', () => {
  //   const roomId = document.getElementById('roomId').value;
  //   const playerId = 'player123';  // 應從用戶會話獲得
  //   socket.emit('joinRoom', { roomId, playerId });
  // });
  
  // socket.on('roomJoined', data => {
  //   console.log('Joined room', data.room);
  //   // 跳轉到遊戲界面或顯示房間內的其他玩家
  // });
  
  
  
  const createRoomButton = document.getElementById('createRoom');
  const newRoomNameInput = document.getElementById('newRoomName');
  createRoomButton.addEventListener('click', () => {
    console.log('23')
    const hostId = '1'
    const name = newRoomNameInput.value;
    socket.emit('createRoom', { name, hostId });
  });
  
  const roomsContainer = document.getElementById('rooms');
  socket.on('updateRooms', (rooms) => {
    roomsContainer.innerHTML = '';
    rooms.forEach(room => {
      const roomDiv = document.createElement('div');
      roomDiv.textContent = `Room ${room.name} (${room.players.length}/6 players)`;
      roomDiv.onclick = () => {
        roomDiv.classList.add('selected');
        socket.emit('joinRoom', { roomId: room.id });
      };
      roomsContainer.appendChild(roomDiv);
    });
  });
  const leaveLobbyButton = document.getElementById('leaveLobby');
  leaveLobbyButton.addEventListener('click', () => {
    window.location.href = '/'; // 或其他適合的行為
  });
});



