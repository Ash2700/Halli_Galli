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
    const roomId = socket.handshake.auth.roomId || null
    const playerId = socket.playerId || null
    const playerName = socket.playerName || null
    if (roomId) socket.join(roomId)


    socket.emit('session', {
      sessionID: socket.sessionID,
      playerId: socket.playerId,
      playerName: socket.playerName,
      roomId: roomId || null
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
    socket.on('createRoom', ({ name }) => {
      roomController.createRoom(name, playerId, playerName)
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
    socket.on('joinRoom', ({ rId }) => {
      roomController.joinRoom(rId, playerId, playerName)
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

    socket.on('leave-room', () => {
      roomController.leaveRoom(roomId, playerId)
        .then(room => { 
          renderPlayerList(room)
          socket.emit('leaveRoomResponse')
        })
        .catch(error => error)
    })
    // 以下遊戲房間
    socket.on('playerReady', () => {
      roomController.playerReady(roomId, playerId)
        .then(({ room, game }) => {
          // 更新房間
          if (room) renderPlayerList(room)
          if (game) {
            renderGameMessage(game)
            updateGameView(game)
          }
        }).catch(error => error)

    })
    //重新連線後更新畫面
    socket.on('updateTheRoom', () => {
      roomController.updateTheRoom(roomId)
        .then(({ room, game }) => {
          if (room) renderPlayerList(room)
          if (game) {
            updateGameView(game)
            renderGameMessage(game)
          }
        })
        .catch(err => err)

    })

    socket.on('flipCard', () => {
      roomController.flipCard(roomId, playerId)
        .then(game => {
          updateGameView(game)
          renderGameMessage(game)
        }).catch(err => console.error(err))
    })
    socket.on('ringTheBell', (roomId, playerId) => {
      roomController.ringTheBell(roomId, playerId)
        .then(game => {
          renderGameMessage(game)
          updateGameView(game)
        }).catch(err => console.error(err))
    })

    socket.on('initializeRoom',()=> {
      roomController.initializeRoom(roomId, playerId)
        .then(({room}) => {
          // 更新房間
          if (room) renderPlayerList(room)
          }
        ).catch(error => error)
    })

    function renderPlayerList(room) {
      io.to(room.id.toString()).emit('renderPlayerList', room.players)
    }
    function updateGameView(data) {
      if (!data) return
      const lastFlippedCards = data.lastFlippedCards
      const players = data.players
      const currentPlayersIndex = data.currentPlayerIndex
      const isActiveGame = data.isActive
      io.to(roomId).emit('updateTheGame', players, lastFlippedCards, currentPlayersIndex,isActiveGame)
    }
    function renderGameMessage(game) {
      if (!game) return
      const messages = game.messages
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