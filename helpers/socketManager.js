const socketIo = require('socket.io')
const roomManager = require('./roomManager');

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
    // 建立新房間和加入
    socket.on('createRoom', ({name, hostId, playerName})=> {
      const room = roomManager.createRoom(name,hostId,playerName)
      if(room) {
        io.emit('updateRooms',roomManager.getRooms())
        socket.join(room.id)
        socket.emit('joinRoomResponse',{success: true,roomId:room.id})
      }
    })
    socket.on('leaveRoom',({roomId, playerId})=>{
      
    })
    socket.on('lobby',()=>{
      io.emit('updateRooms', roomManager.getRooms())
    })
    socket.on('test',(roomId) => {
      console.log(typeof(roomId), roomId)
      socket.join(Number(roomId))
      socket.to(roomId).emit('backtest')
    })
    
    // 加入
    socket.on('joinRoom', ({roomId, playerId,playerName})=> {
      const  room = roomManager.joinRoom(roomId, playerId,playerName)
      if(room){
        roomManager.checkIfReadyToStart(room.id)
        io.emit('updateRoom', roomManager.getRooms())
        socket.join(room.id)
        socket.to(room.id).emit('updateTheRoom',roomManager.getTheRoom(roomId))
        socket.emit('joinRoomResponse', {success: true, roomId})
      }else {
        socket.emit('joinRoomResponse', { success: false, message: 'Room does not exist or is full'})
      }
    })
    socket.on('playerReady',({playerId,roomId})=>{
      // 設定
      roomManager.setPlayerReady(roomId, playerId, true)
      // 更新房間
      socket.to(Number(roomId)).emit('updateTheRoom', roomManager.getTheRoom(roomId))
      //檢查
      if(roomManager.checkIfReadyToStart(roomId)){
        const game = roomManager.games.get(Number(roomId))
        console.log(`${roomId} is starting game`)
        socket.to(Number(roomId)).emit('startGame')
      }
    })

    socket.on('dosomething',roomId=>{
      const length =6
      socket.to(Number(roomId)).emit('updateTheGame',length,[{fruit:'banana',num:1},{fruit:'banana',num:1},{fruit:'banana',num:1},{fruit:'banana',num:1},{fruit:'banana',num:1},{fruit:'banana',num:1}])
    })
  })

  exports.getIO = () =>{
    if(!io){
      throw new Error("Socket.io not initialized!")
    }
    return io
  }

}