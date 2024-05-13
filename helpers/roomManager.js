const { v4: uuidv4 } = require('uuid')
const { Player, Game } = require('../games/index')

class RoomManager {
  constructor() {
    this.rooms = []
    this.games = new Map()
  }

  createRoom(name, hostId, playerName) {
    const newRoom = {
      id: this.rooms.length + 1,
      name, hostId,
      players: [
        {
          id: hostId,
          name: playerName,
          readyToStart: false
        }]
    }
    this.rooms.push(newRoom)
    return newRoom
  }

  getTheRoom(roomId){
    const room = this.rooms.find(room => room.id === Number(roomId))
    return room ? room : null
  }

  getRooms() {
    return this.rooms
  }
  leaveRoom(roomId, playerId) {
    const room = this.getTheRoom(roomId)
    const playerIndex = room.players.findIndex(player => player.id === playerId)
    room.players.splice(playerIndex,1)
  }
  joinRoom(roomId, playerId, playerName) {
    // 防止多房間加入
    const isPlayerInOtherRooms = this.rooms.some(
      room => room.id !== Number(roomId) &&
        room.players.some(player => player.id === playerId))
    if (isPlayerInOtherRooms) return null
    //確認沒有重複加入
    const room = this.getTheRoom(roomId)
    const notRepeat = room.players.every(player => player.id !== playerId)
    if (room && notRepeat && room.players.length < 6) {
      room.players.push({ id: playerId, name: playerName, readyToStart: false })
      return room
    } 
    else if (!notRepeat) return room
    return null
  }
  //追蹤玩家是否要馬上遊戲
  setPlayerReady(roomId, playerId) {
    const player = this.getTheRoom(roomId).players.find(player => player.id === playerId)
    player.readyToStart = !(player.readyToStart)
    // console.log(player.readyToStart)
    this.checkIfReadyToStart(roomId)
  }
  // 追蹤開始條件
  checkIfReadyToStart(roomId) {
    const room=this.getTheRoom(roomId)
    const playerCount = room.players.length
    const AllAgreed = room.players.every(v => v.readyToStart === true)
    // console.log(AllAgreed)
    if (playerCount === 6 || (playerCount > 1 && playerCount < 6 && AllAgreed)) {
      this.startGameProcess(roomId)
      return true
    }
    return false
  }

  startGameProcess(roomId) {
    const room=this.getTheRoom(roomId)
    const newGame = new Game(uuidv4())
    room.players.forEach(player => {
      const newPlayer = new Player(player.id, player.name)
      newGame.addPlayer(newPlayer)
    })
    this.games.set(room.id, newGame)
    newGame.startGame()
  }
}
const roomManager = new RoomManager()
module.exports = roomManager