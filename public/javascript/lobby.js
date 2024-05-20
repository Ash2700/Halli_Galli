
const sessionID = localStorage.getItem("sessionID")
const playerId = localStorage.getItem("playerId") 
const playerName = localStorage.getItem("playerName")
const roomId = localStorage.getItem('joinRoom') ? localStorage.getItem('joinRoom'): null

document.getElementById('show-id').innerHTML = playerId
document.getElementById('show-name').innerHTML = playerName

document.addEventListener('DOMContentLoaded', function () {
  const socket = io();
  socket.auth= { sessionID, roomId }
  socket.on('connect', () => {
    console.log('connect lobby', playerId)
    try {
      socket.emit('lobby')
    } catch (err) { console.error(err)}

  })
  socket.on('session',({sessionID, playerId,playerName,roomId})=> {
    localStorage.setItem("sessionID",sessionID)
    localStorage.setItem("playerId",playerId)
    localStorage.setItem("playerName",playerName)
    localStorage.setItem('joinRoom', roomId)
  })
  // 建立房間
  const createRoomButton = document.getElementById('createRoom');
  const newRoomNameInput = document.getElementById('newRoomName');
  createRoomButton.addEventListener('click', () => {
    const name = newRoomNameInput.value;
    socket.emit('createRoom', {name});
  });

  // 加入房間
  document.getElementById('joinRoom').addEventListener('click', () => {
    const rId = selectedRoomId;
    if(rId) {
      socket.emit('joinRoom', { rId});
    }
  });
  
  // 進入遊戲房間
  socket.on('joinRoomResponse',(response)=>{
    localStorage.setItem('joinRoom', response.roomId)
    if(response.success){
      window.location.href = `/gameRoom.html`
    }else console.log(response.message)
  })
  
  
  
  // 更新大廳資訊
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

  //離開
  const leaveLobbyButton = document.getElementById('leaveLobby');
  leaveLobbyButton.addEventListener('click', () => {
    window.location.href = '/'; // 或其他適合的行為
  });
});



