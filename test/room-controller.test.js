// room-controller.test.js

const roomController = require('../controller/room-controller');
const roomManager = require('../service/room-service');
jest.mock('../service/room-service');

describe('Room Controller', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe('createRoom', () => {
    it('should create a new room and return it along with all rooms', async () => {
      const mockRoom = { id: 1, name: 'Test Room', hostId: 'host123', players: [{ id: 'host123', name: 'Host Player', readyToStart: false }] };
      const mockRooms = [mockRoom];

      roomManager.createRoom.mockResolvedValue(mockRoom);
      roomManager.getRooms.mockResolvedValue(mockRooms);

      const { room, rooms } = await roomController.createRoom('Test Room', 'host123', 'Host Player');

      expect(roomManager.createRoom).toHaveBeenCalledWith('Test Room', 'host123', 'Host Player');
      expect(roomManager.getRooms).toHaveBeenCalled();
      expect(room).toEqual(mockRoom);
      expect(rooms).toEqual(mockRooms);
    });
  });

  describe('joinRoom', () => {
    it('should join an existing room and return it along with all rooms', async () => {
      const mockRoom = { id: 1, name: 'Test Room', hostId: 'host123', players: [{ id: 'host123', name: 'Host Player', readyToStart: false }] };
      const mockJoinedRoom = { id: 1, name: 'Test Room', hostId: 'host123', players: [{ id: 'host123', name: 'Host Player', readyToStart: false }, { id: 'player123', name: 'Player 1', readyToStart: false }] };
      const mockRooms = [mockJoinedRoom];

      roomManager.joinRoom.mockResolvedValue(mockJoinedRoom);
      roomManager.getRooms.mockResolvedValue(mockRooms);
      roomManager.checkIfReadyToStart.mockResolvedValue(false);

      const { room, rooms } = await roomController.joinRoom(1, 'player123', 'Player 1');

      expect(roomManager.joinRoom).toHaveBeenCalledWith(1, 'player123', 'Player 1');
      expect(roomManager.getRooms).toHaveBeenCalled();
      expect(room).toEqual(mockJoinedRoom);
      expect(rooms).toEqual(mockRooms);
    });

    it('should join an existing room and start the game if conditions are met', async () => {
      const mockRoom = { id: 1, name: 'Test Room', hostId: 'host123', players: [{ id: 'host123', name: 'Host Player', readyToStart: false }] };
      const mockJoinedRoom = { id: 1, name: 'Test Room', hostId: 'host123', players: [{ id: 'host123', name: 'Host Player', readyToStart: false }, { id: 'player123', name: 'Player 1', readyToStart: false }] };
      const mockRooms = [mockJoinedRoom];
      const mockGame = { id: 'game123', players: [], deck: [], currentPlayerIndex: -1, isActive: false, tableCards: [], lastFlippedCards: [], messages: [] };

      roomManager.joinRoom.mockResolvedValue(mockJoinedRoom);
      roomManager.getRooms.mockResolvedValue(mockRooms);
      roomManager.checkIfReadyToStart.mockResolvedValue(true);
      roomManager.getTheGame.mockResolvedValue(mockGame);

      const { room, rooms, game } = await roomController.joinRoom(1, 'player123', 'Player 1');

      expect(roomManager.joinRoom).toHaveBeenCalledWith(1, 'player123', 'Player 1');
      expect(roomManager.getRooms).toHaveBeenCalled();
      expect(roomManager.getTheGame).toHaveBeenCalledWith(1);
      expect(room).toEqual(mockJoinedRoom);
      expect(rooms).toEqual(mockRooms);
      expect(game).toEqual(mockGame);
    });
  });
});
