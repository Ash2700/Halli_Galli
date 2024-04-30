// Game.test.js
const { Game, Player } = require('../games'); // 調整路徑以匹配您的檔案結構

describe('Game', () => {
  test('should allow adding a player when under player limit', () => {
    const game = new Game(1);
    const player = new Player(1);
    expect(game.addPlayer(player)).toBeTruthy();
    expect(game.players.length).toBe(1);
  });

  test('should not allow adding a player when at player limit', () => {
    const game = new Game(1);
    // 假設遊戲最多六人
    for (let i = 0; i < 6; i++) {
      game.addPlayer(new Player(i));
    }
    expect(game.addPlayer(new Player(7))).toBeFalsy();
    expect(game.players.length).toBe(6);
  });
  test('should start the game if there are enough players', () => {
    const game = new Game(1);
    game.addPlayer(new Player(1));
    game.addPlayer(new Player(2));
    game.startGame();
    expect(game.isActive).toBe(true);
  });
  test('should allow a player to flip a card if they have cards', () => {
    const game = new Game(1);
    const player = new Player(1);
    player.cards.push({ fruit: 'Apple', num: 1 });
    game.addPlayer(player);
    game.playCard(player.id);
    expect(player.cards.length).toBe(0);
    expect(game.tableCards.length).toBe(1)
  });
  test('should flipped card sum total be 5', () => {
    const game = new Game(1)
    game.lastFlippedCards.push({ fruit: 'Apple', num: 2 }, { fruit: 'Apple', num: 3 }, { fruit: 'Banana', num: 2 })
    const isTrue = game.updateTotal()
    expect(isTrue).toBe(true)
  })
  test('should collect table cards if bell is rung correctly', () => {
    const game = new Game(1);
    const player = new Player(1);
    player.cards.push({ fruit: 'Apple', num: 5 });
    game.addPlayer(player);
    game.playCard(player.id);
    game.ringTheBell(player.id);
    expect(player.cards.length).toBe(1);
  });
  test('should other player tableCardsCount be zero ', () => {
    const game = new Game(1);
    const player = new Player(1);
    const player2 = new Player(2);
    player.cards.push({ fruit: 'Apple', num: 5 });
    game.tableCards= [{ fruit: 'Apple', num: 3 },{ fruit: 'Apple', num: 2 },{ fruit: 'Apple', num: 1 }]
    player2.tableCardsCount = 3
    game.addPlayer(player);
    game.addPlayer(player2);
    game.playCard(player.id);
    game.ringTheBell(player.id);
    expect(player.cards.length).toBe(4);
    expect(player2.tableCardsCount).toBe(0)
    expect(game.lastFlippedCards.length).toBe(0)
  })
  test('should be out', () => {
    const game = new Game(1)
    const player = new Player(1)
    game.addPlayer(player)
    game.checkForElimination()
    expect(game.players.length).toBe(0)
  })
});
