class RoomManager{
  constructor(){
    this.rooms =[]
  }

  createRoom(name, hostId){
    const newRoom = { id: this.rooms.length +1, name, hostId, players:[hostId]}
    this.rooms.push(newRoom)
    return newRoom
  }

  getRooms(){
    return this.rooms
  }

  joinRoom(roomId, playerId){
    const room = this.rooms.find(room => room.id === roomId)
    if(room && !room.players.include(playerId)){
      room.players.push(playerId)
      return room
    }
    return null
  }
}
const roomManager = new RoomManager()
module.exports = roomManager