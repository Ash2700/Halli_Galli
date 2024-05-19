const { v4: uuidv4 } = require('uuid')
const { Player, Game } = require('./game-service')
const client = require('../helpers/redis')

class RoomManager {
  constructor() {
    this.roomsKey = 'rooms'
    this.gamesKey = 'games'
  }
  async getRooms() {
    const roomData = await client.hGetAll(this.roomsKey)
    return Object.values(roomData).map(room => JSON.parse(room))
  }
  async createRoom(name, hostId, playerName) {
    try {
      const rooms = await this.getRooms()
      const isRePeatCreate = rooms.some(room => {
        room.players.some(player => player.id === hostId)
      })

      if (isRePeatCreate) throw new Error('Not rePeat create room or join room')
      const newRoom = {
        id: rooms.length + 1,
        name, hostId,
        players: [
          {
            id: hostId,
            name: playerName,
            readyToStart: false
          }]
      }
      await client.hSet(this.roomsKey, newRoom.id.toString(), JSON.stringify(newRoom))
      return newRoom
    } catch (error) {
      return error
    }
  }

  async getTheRoom(roomId) {
    try {
      const roomData = await client.hGet(this.roomsKey, roomId.toString())
      return roomData ? JSON.parse(roomData) : null
    } catch (error) {
      throw error
    }
  }

  async leaveRoom(roomId, playerId) {
    const room = await this.getTheRoom(roomId);
    if (!room) return;
    room.players = room.players.filter(player => player.id !== playerId);
    await client.hSet(this.roomsKey, room.id.toString(), JSON.stringify(room));
    return room;
  }

  async isPlayerInOtherRooms(roomId, playerId) {
    const rooms = await this.getRooms()
    return rooms.some(room => room.id !== Number(roomId) &&
      room.players.some(player => player.id === playerId))
  }
  async joinRoom(roomId, playerId, playerName) {
    // 防止多房間加入
    if (await this.isPlayerInOtherRooms(roomId, playerId)) throw new ERROR('repeat join room')
    //確認沒有重複加入
    const room = await this.getTheRoom(roomId)
    const notRepeat = room.players.every(player => player.id !== playerId)
    if (room && notRepeat && room.players.length < 6) {
      room.players.push({ id: playerId, name: playerName, readyToStart: false })
      client.hSet(this.roomsKey, room.id.toString(), JSON.stringify(room))
      return  room
    }
    else if (!notRepeat) return room
    return null
  }
  //追蹤玩家是否要馬上遊戲
  async setPlayerReady(roomId, playerId) {
    const room = await this.getTheRoom(roomId)
    const player = room.players.find(player => player.id === playerId)
    player.readyToStart = !(player.readyToStart)
    await client.hSet(this.roomsKey, room.id.toString(), JSON.stringify(room))
  }
  // 追蹤開始條件
  async checkIfReadyToStart(roomId) {
    const room = await this.getTheRoom(roomId);
    const playerCount = room.players.length;
    const allAgreed = room.players.every(v => v.readyToStart === true);
    const gameExists = await this.getTheGame(roomId);

    if (gameExists) return true;
    if (playerCount === 6 || (playerCount > 1 && playerCount < 6 && allAgreed)) {
      await this.startGameProcess(roomId);
      return true;
    }
    return false;
  }

  async startGameProcess(roomId) {
    const room = await this.getTheRoom(roomId);
    const newGame = new Game(uuidv4());
    room.players.forEach(player => {
      const newPlayer = new Player(player.id, player.name);
      newGame.addPlayer(newPlayer);
    });
    newGame.startGame();
    await client.hSet(this.gamesKey, room.id.toString(), JSON.stringify(newGame));
  }

  async getTheGame(roomId) {
    const gameData = await client.hGet(this.gamesKey, roomId.toString());
    return gameData ? JSON.parse(gameData) : null;
  }
}
const roomManager = new RoomManager()
module.exports = roomManager