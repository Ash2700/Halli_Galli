const { v4: uuidv4 } = require('uuid')
const { Player, Game } = require('../games/index')

class RoomManager {
  constructor() {
    this.rooms = []
    this.games = new Map()
  }

  createRoom(name, hostId) {
    const newRoom = { id: this.rooms.length + 1, name, hostId, players: [{ id: hostId, readyToStart: false }] }
    this.rooms.push(newRoom)
    return newRoom
  }

  getRooms() {
    return this.rooms
  }

  joinRoom(roomId, playerId) {
    const room = this.rooms.find(room => room.id === roomId)
    if (room && !room.players.includes(playerId) && room.players.length < 7) {
      room.players.push({ id: playerId, readyToStart: false })
      return room
    }
    return null
  }
  //追蹤玩家是否要馬上遊戲
  setPlayerReady(roomId, playerId, isReady) {
    const room = this.rooms.find(room => room.id === Number(roomId))
    const player = room.players.find(player => player.id === playerId)
    player.readyToStart = !(player.readyToStart)
    this.checkIfReadyToStart(room)
  }
  // 追蹤開始條件
  checkIfReadyToStart(room) {
    const playerCount = room.players.length
    const AllAgreed = room.players.every(v => v.readyToStart === true)
    console.log(AllAgreed)
    if (playerCount === 6 || (playerCount < 5 && playerCount > 2 && AllAgreed)) {
      const newGame = new Game(uuidv4())
      newGame.initializeDeck()
      newGame.shuffleDeck()
      this.games.set(room.id, newGame)
      newGame.startGame()
      return true
    }
    return false
  }
}
const roomManager = new RoomManager()
module.exports = roomManager