require('dotenv').config()
const { createServer } = require("node:http");
const socketManger = require('../socket/socketManager')
const ioc = require("socket.io-client");
const app = require('../app')

function waitFor(socket, event) {
  return new Promise((resolve) => {
    socket.once(event, resolve);
  });
}

describe("my awesome project", () => {
  let io, serverSocket, clientSocket;

  beforeAll((done) => {
    const server = createServer(app);
    socketManger.init(server);
    io = socketManger.getIO()
    server.listen(() => {
      const port = server.address().port;
      clientSocket = ioc(`http://localhost:${port}`);
      clientSocket.auth = { playerName: 'test1000' }
      io.on("connection", (socket) => {
        serverSocket = socket;
      });
      clientSocket.on('connect', done)
    });
  });

  afterAll(() => {
    io.close();
    clientSocket.disconnect();
  });

  test("should connect", (done) => {
    clientSocket.on("hello", (arg) => {
      expect(arg).toBe("world");
      done();
    });
    serverSocket.emit("hello", "world");
  });

  // test("should work with an acknowledgement", (done) => {
  //   serverSocket.on("hi", (cb) => {
  //     cb("hola");
  //   });
  //   clientSocket.emit("hi", (arg) => {
  //     expect(arg).toBe("hola");
  //     done();
  //   });
  // });

  // test("should work with emitWithAck()", async () => {
  //   serverSocket.on("foo", (cb) => {
  //     cb("bar");
  //   });
  //   const result = await clientSocket.emitWithAck("foo");
  //   expect(result).toBe("bar");
  // });

  // test("should work with waitFor()", () => {
  //   clientSocket.emit("baz");

  //   return waitFor(serverSocket, "baz");
  // });
});