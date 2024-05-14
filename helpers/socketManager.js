const socketIo = require('socket.io')
const roomManager = require('./roomManager');

let io = null;

exports.init = (server) => {
  io = socketIo(server)
  io.on('connection', (socket) => {
    console.log('New client connected')

    socket.on('disconnected', ()=>{
      console.log('Client disconnected')
    })
    socket.on('message', (msg) =>{
      console.log('Message from client', msg)
      socket.emit('message', 'Hello from Server')
    })
    // 建立新房間和加入
    socket.on('createRoom', ({name, hostId, playerName})=> {
      const room = roomManager.createRoom(name,hostId,playerName)
      if(room) {
        io.emit('updateRooms',roomManager.getRooms())

        io.socketsJoin(room.id)

        socket.emit('joinRoomResponse',{success: true,roomId:room.id})
      }
    })
    socket.on('leaveRoom',({roomId, playerId})=>{
      
    })
    socket.on('lobby',()=>{
      io.emit('updateRooms', roomManager.getRooms())
    })
    
    // 加入
    socket.on('joinRoom', ({roomId, playerId,playerName})=> {
      const  room = roomManager.joinRoom(roomId, playerId,playerName)
      if(room){
        roomManager.checkIfReadyToStart(room.id)
        io.emit('updateRoom', roomManager.getRooms())
        socket.join(room.id)
        io.to(room.id).emit('updateTheRoom',roomManager.getTheRoom(roomId))
        socket.emit('joinRoomResponse', {success: true, roomId})
      }else {
        socket.emit('joinRoomResponse', { success: false, message: 'Room does not exist or is full'})
      }
    })

    // 以下遊戲房間

    socket.on('playerReady',({playerId,roomId})=>{
      const rId = Number(roomId) 
      // 設定
      roomManager.setPlayerReady(roomId, playerId, true)
      // 更新房間
      socket.join(rId)
      socket.to(rId).emit('updateTheRoom', roomManager.getTheRoom(roomId))
      //檢查
      if(roomManager.checkIfReadyToStart(roomId)){
        console.log(`room ${roomId}: is starting game`)
        // 更新 gameview
        updateGameView(roomId)
      }
    })
    function updateGameView(roomId){
      console.log(socket.rooms)
      const rId = Number(roomId)
      const data  = roomManager.games.get(rId)
      const lastFlippedCards = data.lastFlippedCards
      const players = data.players
      io.to(rId).emit('updateTheGame',players,lastFlippedCards)
    }

    socket.on('flipCard',(roomId, playerId) => {
      const rId = Number(roomId)
      const  game = roomManager.games.get(rId)
      game.playCard(playerId)
      updateGameView(roomId)
    })

    socket.on('updateGameView',roomId=>{
        updateGameView(roomId)
    })
  })

  exports.getIO = () =>{
    if(!io){
      throw new Error("Socket.io not initialized!")
    }
    return io
  }

}