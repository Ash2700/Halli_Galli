const roomManager = require('../service/room-service');

const roomController = {

  createRoom: async (name, hostId, playerName) => {
    const room = await roomManager.createRoom(name, hostId, playerName)
    const rooms = await roomManager.getRooms()
    return { room, rooms }
  },

  joinRoom: async (roomId, playerId, playerName) => {
    return Promise.all([
      roomManager.joinRoom(roomId, playerId, playerName),
      roomManager.getRooms(),
      roomManager.checkIfReadyToStart(roomId)
    ]).then(([room,rooms,isStartGame]) => {
      if (isStartGame) {
        const  game =  roomManager.getTheGame(roomId)
        return { room, rooms, game }
      }
      else return {room, rooms}
    }).catch(err => err)

  },

  leaveRoom: async (roomId, playerId) => {
    return roomManager.leaveRoom(roomId, playerId)
  },

  playerReady: async (roomId, playerId) => {
    if (!roomId) throw new Error('some thing wrong: not roomId')
    const game = await roomManager.getTheGame(roomId)
  //防止遊戲中變更
    if (!game) await roomManager.setPlayerReady(roomId, playerId, true)
    const room = await roomManager.getTheRoom(roomId)
    const isStartGame = await roomManager.checkIfReadyToStart(roomId)
    if (isStartGame) game = await roomManager.getTheGame(roomId)
    return { room, game}
  },

  flipCard: async (roomId, playerId) => {
    const game = await roomManager.getTheGame(roomId)
    game.playCard(playerId)
    return  game
  },

  ringTheBell: async (roomId, playerId) => {
    const game = roomManager.getTheGame(roomId)
    game.ringTheBell(playerId)
    return await game
  },

  updateTheRoom: async (roomId, playerId) => {
    const room = await roomManager.getTheRoom(roomId)
    const game = await roomManager.getTheGame(roomId)
    return { room, game }
  },

  getRooms: async () => {
    const rooms = await roomManager.getRooms()
    return rooms
  }

}

module.exports = roomController