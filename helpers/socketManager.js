const socketIo = require('socket.io')
const roomManager = require('./roomManager');

let io = null;

exports.init = (server) => {
  io = socketIo(server)
  io.on('connection', (socket) => {
    console.log('New client connected')

    socket.on('disconnected', () => {
      console.log('Client disconnected')
    })
    socket.on('message', (msg) => {
      console.log('Message from client', msg)
      socket.emit('message', 'Hello from Server')
    })
    // 建立新房間和加入
    socket.on('lobby', () => {
      io.emit('updateRooms', roomManager.getRooms())
    })
    socket.on('createRoom', ({ name, hostId, playerName }) => {
      const room = roomManager.createRoom(name, hostId, playerName)
      if (room) {
        io.emit('updateRooms', roomManager.getRooms())
        socket.emit('joinRoomResponse', { success: true, roomId: room.id })
        socket.join(room.id)
      }
    })

    // 加入
    socket.on('joinRoom', ({ roomId, playerId, playerName }) => {
      const room = roomManager.joinRoom(roomId, playerId, playerName)
      if (room) {
        roomManager.checkIfReadyToStart(room.id)
        io.emit('updateRooms', roomManager.getRooms())
        socket.emit('joinRoomResponse', { success: true, roomId })
        socket.join(room.id)
        io.to(room.id).emit('renderPlayerList', roomManager.getTheRoom(roomId))
      } else {
        socket.emit('joinRoomResponse', { success: false, message: 'Room does not exist or is full' })
      }
    })
    socket.on('leaveRoom', ({ roomId, playerId }) => {
    })
    // 以下遊戲房間
    socket.on('playerReady', ({ playerId, roomId }) => {
      if (!roomId) return
      const rId = Number(roomId)
      const game = getGameObj(roomId)
      const room = roomManager.getTheRoom(roomId)
      // 設定
      if (!game) roomManager.setPlayerReady(roomId, playerId, true)
      // 更新房間
      socket.join(rId)
      if (room) renderPlayerList(room)
      //檢查
      if (game) io.to(Number(roomId)).emit('renderMessage', game.getMessages())
      if (roomManager.checkIfReadyToStart(roomId)) {
        // 更新 gameview
        updateGameView(roomId)
      }
    })
    //重新連線後更新畫面
    socket.on('updateTheRoom', (roomId, playerId) => {
      const room = roomManager.getTheRoom(roomId)
      if (room) renderPlayerList(room)
      const game = getGameObj(roomId)
      if (game) {
        updateGameView(roomId)
        renderGameMessage(roomId)
      }
      
    })
    socket.on('updateGameView', roomId => {
      updateGameView(roomId)
    })
    socket.on('flipCard', (roomId, playerId) => {
      const game = getGameObj(roomId)
      game.playCard(playerId)
      updateGameView(roomId)
    })
    socket.on('ringTheBell', (roomId, playerId) => {
      const game = getGameObj(roomId)
      game.ringTheBell(playerId)
      socket.join(Number(roomId))
      const messages = game.getMessages()
      io.to(Number(roomId)).emit('renderMessage', messages)
      updateGameView(roomId)
    })

    function getGameObj(roomId) {
      const rId = Number(roomId)
      const data = roomManager.games.get(rId)
      return data
    }
    function renderPlayerList(room) {
      socket.join(room.id)
      io.to(room.id).emit('renderPlayerList', room.players)
    }
    function updateGameView(roomId) {
      const data = getGameObj(roomId)
      if(!data) return 
      const lastFlippedCards = data.lastFlippedCards
      const players = data.players
      const currentPlayersIndex = data.currentPlayerIndex
      io.to(Number(roomId)).emit('updateTheGame', players, lastFlippedCards, currentPlayersIndex)
    }
    function renderGameMessage(roomId){
      const game =getGameObj(roomId)
      if(!game) return 
      socket.join(Number(roomId))
      const messages = game.getMessages()
      io.to(Number(roomId)).emit('renderMessage', messages)
    }
  })

  exports.getIO = () => {
    if (!io) {
      throw new Error("Socket.io not initialized!")
    }
    return io
  }

}