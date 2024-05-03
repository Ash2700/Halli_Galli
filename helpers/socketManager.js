const socketIo = require('socket.io')
const roomManager = require('./roomManager');
const { Player } = require('../games');

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
    socket.on('createRoom', ({name, hostId})=> {
      console.log(name)
      const room = roomManager.createRoom(name,hostId)
      if(room) {
        io.emit('updateRooms',roomManager.getRooms())
      }
    })
    socket.on('updateRooms', () => {
      const rooms = roomManager.rooms
      socket.emit('updateRooms',{rooms})
    })
    socket.on('joinRoom', ({roomId, plyerId})=> {
      const  room = roomManager.joinRoom(roomId, plyerId)
      if(room){
        io.to(room.id).emit('roomJoined', {room})
      }
    })
  })

  exports.getIO = () =>{
    if(!io){
      throw new Error("Socket.io not initialized!")
    }
    return io
  }

}