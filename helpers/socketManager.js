const socketIo = require('socket.io')
const roomManager = require('./roomManager');
const { Player, Game } = require('../games/index');

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
      const room = roomManager.createRoom(name,hostId)
      if(room) {
        io.emit('updateRooms',roomManager.getRooms())
        socket.join(room.id)
        socket.emit('joinRoomResponse',{success: true,roomId:room.id})
      }
    })
    socket.on('callRooms',() =>[
      io.emit('updateRooms',roomManager.getRooms())
    ])
    socket.on('joinRoom', ({roomId, playerId})=> {
      const  room = roomManager.joinRoom(roomId, playerId)
      if(room){
        io.emit('updateRooms', roomManager.getRooms())
        socket.join(roomId)
        socket.emit('joinRoomResponse', {success: true, roomId})
      }else {
        socket.emit('joinRoomResponse', { success: false, message: 'Room does not exist or is full'})
      }
    })
    socket.on('playerReady',({playerId,roomId})=>{
      roomManager.setPlayerReady(roomId, playerId, true)
    })
  })

  exports.getIO = () =>{
    if(!io){
      throw new Error("Socket.io not initialized!")
    }
    return io
  }

}