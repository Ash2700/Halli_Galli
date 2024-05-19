const socketIo = require('socket.io')
const roomController = require('../controller/room-controller')
const { v4: uuidv4 } = require('uuid')
const InMemorySessionStore = require('../service/session-service')
const sessionStorage = new InMemorySessionStore

let io = null;

exports.init = (server) => {
  io = socketIo(server)
  io.use((socket, next) => {
    const sessionID = socket.handshake.auth.sessionID
    if (sessionID) {
      const session = sessionStorage.findSession(sessionID)
      if (session) {
        socket.sessionID = sessionID
        socket.playerId = session.playerId
        socket.playerName = session.playerName
        return next()
      }
    }


    const playerName = socket.handshake.auth.playerName
    if (!playerName) {
      return next(new Error('invalid userName'))
    }
    socket.sessionID = uuidv4()
    socket.playerId = uuidv4()
    socket.playerName = playerName
    sessionStorage.saveSession(socket.sessionID, { playerId: socket.playerId, playerName })
    next()
  })

  io.on('connection', (socket) => {
    const roomId = socket.handshake.auth.roomId
    console.log(roomId)
    if (roomId) socket.join(roomId)


    socket.emit('session', {
      sessionID: socket.sessionID,
      playerId: socket.playerId,
      playerName: socket.playerName
    })

    socket.on('disconnect', (reason) => {
      if (socket.active) {

      }
      console.log(`disconnect ${socket.id} due to ${reason}`)
    })

    socket.on('lobby', () => {
      roomController.getRooms()
        .then(rooms => {
          io.emit('updateRooms', rooms)
        }).catch(err => console.error(err))
    })
    // 建立新房間和加入
    socket.on('createRoom', ({ name, hostId, playerName }) => {
      roomController.createRoom(name, hostId, playerName)
        .then(({ room, rooms }) => {
          if (room) {
            socket.joinRoom = room.id.toString()
            socket.join(socket.joinRoom)
            io.emit('updateRooms', rooms)
            socket.emit('joinRoomResponse', { success: true, roomId: socket.joinRoom })
          }
        })
        .catch(err => console.error(err))


    })
    // 加入
    socket.on('joinRoom', ({ roomId, playerId, playerName }) => {
      roomController.joinRoom(roomId, playerId, playerName)
        .then(({ room, rooms, game }) => {
          if (room) {
            socket.joinRoom = room.id.toString()
            socket.join(socket.joinRoom)
            io.emit('updateRooms', rooms)
            socket.emit('joinRoomResponse', { success: true, roomId: socket.joinRoom })
          }
          else socket.emit('joinRoomResponse', { success: false, message: 'Room does not exist or is full' })
          if (game) updateGameView(game, roomId)
        })
        .catch(error => console.error(error))
    })

    socket.on('leaveRoom', ({ roomId, playerId }) => {
      roomController.leaveRoom(roomId, playerId)
        .then(result => console.log(`玩家${result}離開房間`))
        .catch(error => error)
    })
    // 以下遊戲房間
    socket.on('playerReady', ({ playerId, roomId }) => {
      roomController.playerReady(roomId, playerId)
        .then(({ room, game, isStartGame }) => {
          // 更新房間
          console.log(room)
          if (room) renderPlayerList(room)
          if (game) {
            renderGameMessage(game, roomId)
            updateGameView(game, roomId)
          }
        }).catch(error => error)

    })
    //重新連線後更新畫面
    socket.on('updateTheRoom', async (roomId, playerId) => {
      try {
        const { room, game } = await roomController.updateTheRoom(roomId, playerId)
        if (room) renderPlayerList(room)
        if (game) {
          updateGameView(game, roomId)
          renderGameMessage(game, roomId)
        }
      }
      catch (err) { err }

    })

    socket.on('flipCard', (roomId, playerId) => {
      roomController.flipCard(roomId, playerId).then(game => {
        updateGameView(game, roomId)
      }).catch(error => console.error(error))
    })
    socket.on('ringTheBell', (roomId, playerId) => {
      try {
        const game = roomController.ringTheBell(roomId, playerId)
        const messages = game.getMessages()
        io.to(Number(roomId)).emit('renderMessage', messages)
        updateGameView(game, roomId)
      } catch (error) { console.error(error) }

    })

    function renderPlayerList(room) {
      io.to(room.id.toString()).emit('renderPlayerList', room.players)
    }
    function updateGameView(data, roomId) {
      if (!data) return
      const lastFlippedCards = data.lastFlippedCards
      const players = data.players
      const currentPlayersIndex = data.currentPlayerIndex
      io.to(roomId).emit('updateTheGame', players, lastFlippedCards, currentPlayersIndex)
    }
    function renderGameMessage(game, roomId) {
      if (!game) return
      const messages = game.getMessages()
      io.to(roomId).emit('renderMessage', messages)
    }


  })

  exports.getIO = () => {
    if (!io) {
      throw new Error("Socket.io not initialized!")
    }
    return io
  }

}