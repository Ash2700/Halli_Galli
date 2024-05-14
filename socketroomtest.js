const {Server} = require('socket.io')
const {createServer} = require('http')

const httpServer = createServer()
const io = new Server(httpServer,{

})
const lobby = io.of('/looby')
io.on('connection',(socket) =>{

})

httpServer.listen(3000)