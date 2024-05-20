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
    const rooms = await this.getRooms()
    const isRePeatCreate = rooms.some(room => room.players.some(player => player.id === hostId))
    if (isRePeatCreate) throw new Error('Not rePeat create room or join room')
    const newRoom = {
      id: uuidv4(),
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
  }

  async getTheRoom(roomId) {
    const roomData = await client.hGet(this.roomsKey, roomId.toString())
    console.log('room service get the room', roomData)
    return roomData ? JSON.parse(roomData) : null
  }

  async leaveRoom(roomId, playerId) {
    const room = await this.getTheRoom(roomId);
    if (!room) throw new Error('There are not exist')
    room.players = room.players.filter(player => player.id !== playerId);
    await client.hSet(this.roomsKey, room.id.toString(), JSON.stringify(room));
    if(room.players.length === 0) client.hDel(this.roomsKey,room.id.toString())
    return room;
  }

  async isPlayerInOtherRooms(roomId, playerId) {
    const rooms = await this.getRooms()
    return rooms.some(room => room.id.toString() !== roomId.toString() &&
      room.players.some(player => player.id === playerId))
  }
  async joinRoom(roomId, playerId, playerName) {
    console.log('room serviec join start')
    // 防止多房間加入
    if (await this.isPlayerInOtherRooms(roomId, playerId)) throw new ERROR('repeat join room')
    //確認沒有重複加入
    const room = await this.getTheRoom(roomId)
    const game = await this.getTheGameData(roomId)
    if(game ) throw new Error('game is  starting') 
    console.log('contro-joinroom', room)
    const notRepeat = room.players.every(player => player.id !== playerId)
    console.log(notRepeat)
    if (room && notRepeat && room.players.length < 6) {
      room.players.push({ id: playerId, name: playerName, readyToStart: false })
      client.hSet(this.roomsKey, room.id.toString(), JSON.stringify(room))
      console.log('room-service-room', room)
      return room
    }
    else if (!notRepeat) return room
    return null
  }
  //追蹤玩家是否要馬上遊戲
  async setPlayerReady(roomId, playerId) {
    const room = await this.getTheRoom(roomId)
    console.log('room-servies settplay read room', room)
    const player = room.players.find(player => player.id === playerId)
    console.log('room-servies settplay read player', player)
    player.readyToStart = !(player.readyToStart)
    client.hSet(this.roomsKey, room.id.toString(), JSON.stringify(room))
    return room
  }
  // 追蹤開始條件
  async checkIfReadyToStart(roomId) {
    console.log('room serviec check start')
    const room = await this.getTheRoom(roomId)
    console.log('contorler chec雌 to star',room)
    const playerCount = room.players.length;
    const allAgreed = room.players.every(v => v.readyToStart === true);
    console.log('allAgreed',allAgreed)
    const gameExists =await  client.hExists(this.gamesKey, roomId.toString());
    console.log('controller check start game exist', await gameExists)
    if ( gameExists) return true;
    if (playerCount === 6 || (playerCount > 1 && playerCount < 6 && allAgreed)) {
      this.startGameProcess(room);
      return true;
    }
    return false;
  }

  startGameProcess(room) {
    const newGame = new Game(uuidv4());
    room.players.forEach(player => {
      const newPlayer = new Player(player.id, player.name);
      newGame.addPlayer(newPlayer);
    });
    newGame.startGame();
    console.log('room service start game process', newGame)
    return this.saveTheGame(room.id, newGame)
  }

  async getTheGame(roomId) {
    const gameData = await client.hGet(this.gamesKey, roomId.toString());
    console.log(gameData)
    console.log(Game.fromJSON(gameData))
    return gameData ? Game.fromJSON(gameData) : null
  }
  async getTheGameData(roomId) {
    const gameData = await client.hGet(this.gamesKey, roomId.toString())
    console.log('room service get game data',JSON.parse(gameData))
    return gameData ? JSON.parse(gameData) : null
  }

  async saveTheGame(roomId, game) {
    // Ensure the game object is properly formatted for JSON storage
    const gameData = {
      id: game.id,
      players: game.players,
      deck: game.deck,
      currentPlayerIndex: game.currentPlayerIndex,
      isActive: game.isActive,
      tableCards: game.tableCards,
      lastFlippedCards: game.lastFlippedCards,
      messages: game.messages.messages  // Storing only the messages array if MessageManager stores them in a more complex structure
    };
    return client.hSet(this.gamesKey, roomId.toString(), JSON.stringify(gameData));
  }

  async flipCard(roomId, playerId) {
    const game = await roomManager.getTheGame(roomId)
    console.log('servies flip', game)
    game.playCard(playerId)
    console.log('servies fliped', game)
    return this.saveTheGame(roomId, game)
  }
  async ringTheBell(roomId, playerId) {
    const game = await roomManager.getTheGame(roomId)
    game.ringTheBell(playerId)
    return this.saveTheGame(roomId, game)
  }
}
const roomManager = new RoomManager()
module.exports = roomManager