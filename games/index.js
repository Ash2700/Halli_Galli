class Game {
  constructor(id) {
    this.id = id // 遊戲id
    this.players = [] // 存玩家訊息
    this.deck = [] // 牌推
    this.currentPlayerIndex = 0 // 目前進行玩家的索引
    this.isActive = false // 遊戲是否進行
    this.readyToStart = new Map()
    this.tableCards = [],
    this.lastFlippedCards = []
  }
  // 加入玩家
  addPlayer(player) {
    if (this.players.length < 6) {
      this.players.push(player)
      this.readyToStart.set(player.id, false)
      return true
    }
    return false
  }
  // 初始牌堆
  initializeDeck() {
    const fruits = ['Apple', 'Banana', 'Cherry', 'Orange']
    const quantities = {
      1: 3, // 1 的數量3
      2: 3,
      3: 3,
      4: 3,
      5: 2
    }
    fruits.forEach(fruit => {
      Object.keys(quantities).forEach(number => {
        for (let i = 0; i < quantities[number]; i++) {
          this.deck.push({ fruit, num: Number(number) })
        }
      })
    })
  }
  // 切牌
  shuffleDeck() {
    for (let i = this.deck.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1));
      [this.deck[i], this.deck[j]] = [this.deck[j], this.deck[i]]
    }
  }
  //追蹤玩家是否要馬上遊戲
  setPlayerReady(playerId, isReady) {
    if (this.readyToStart.has(playerId)) {
      this.readyToStart.set(playerId, isReady)
      this.checkIfReadyToStart()
    }
  }
  // 追蹤開始條件
  checkIfReadyToStart() {
    const playerCount = this.players.length
    const AllAgreed = Array.from(this.readyToStart.values()).every(v => v === true)
    if (playerCount === 6 || (playerCount < 5 && AllAgreed)) {
      this.startGame()
    }
  }
  // 開始
  startGame() {
    if (this.players.length >= 2) {
      this.isActive = true,
        this.dealCards(this.players.length)
      console.log(`Game Start, 共有${this.players.length}名玩家參與`)
    } else {
      console.log('不足最少玩家數,遊戲無法開始')
    }
  }
  // 發牌
  dealCards(playerCount) {
    const cardDistribution = { 2: 28, 3: 18, 4: 14, 5: 11, 6: 9 }
    const cardsToRemove = { 2: 0, 3: 2, 4: 0, 5: 1, 6: 2 }
    // 移除指定數量的牌
    this.deck.splice(0, cardsToRemove[playerCount])
    // 定義發牌數量
    const cardCount = cardDistribution[playerCount]
    this.players.forEach(player => {
      player.cards = []
      for (let i = 0; i < cardCount; i++) {
        if (this.deck.length > 0) {
          player.cards.push(this.deck.pop())
        }
      }
    })
  }
  // 玩家翻牌
  playCard(playerId) {
    const player = this.players.find(p => p.id === playerId)
    if (!player || player.cards.length === 0) {
      return
    }
    const flippedCard = player.cards.shift()
    this.tableCards.push(flippedCard)
    player.tableCardsCount++
    this.lastFlippedCards[this.currentPlayerIndex] = flippedCard
    this.updateTotal()
    this.nextPlayer()
  }
  // 更新加總
  updateTotal() {
    const fruitCounts = {}
    this.lastFlippedCards.forEach(card => {
      if (card) { // there are card
        fruitCounts[card.fruit] = ((fruitCounts[card.fruit] || 0) + card.num)
      }
    })

    return Object.values(fruitCounts).some(count => count === 5)
  }
  // 按鈴
  ringTheBell(playerId) {
    const resetCount = 0
    const isCorrect = this.updateTotal(); // 更新並檢查是否達到5
    if (isCorrect) {
      // 正確按鈴，收集桌面上的牌
      this.players.find(p => p.id === playerId).cards.push(...this.tableCards);
      // 清空桌面的牌
      this.tableCards = []
      // 清空玩家面前的牌
      this.lastFlippedCards = [];
      // 清空玩家翻排的紀錄
      this.players.forEach(p => { p.tableCardsCount = resetCount })
      console.log(`玩家 ${playerId} 正確按鈴，收走了所有桌面上的牌。`);
    } else {
      // 錯誤按鈴，給其他每個玩家一張牌作為懲罰
      const mistakePlayer = this.players.find(p => p.id === playerId)
      this.players.forEach(p => {
        if (p.id !== playerId && mistakePlayer.cards.length > 0) {
          p.cards.push(mistakePlayer.Cards.pop());
        }
      });
      console.log(`玩家 ${playerId} 按錯了鈴，向每位玩家發了一張牌作為懲罰。`);
    }
  }
  // 出局
  checkForElimination() {
    this.players = this.players.filter(player => {
      if (player.cards.length > 0 || player.tableCardsCount > 0) {
        return true // 手上 和 桌上還有牌
      } else {
        console.log(`玩家 ${player.id} 出局`)
        return false
      }
    })
    if (this.players.length === 2) {
      this.endGame()
    }
  }
  // 遊戲結束
  endGame() {
    this.isActive = false
    if (this.players.length === 2) {
      const [player1, player2] = this.players
      const totalCardsPlayer1 = player1.cards.length;
      const totalCardsPlayer2 = player2.cards.length;

      const winner = totalCardsPlayer1 > totalCardsPlayer2 ? player1 : player2;
      console.log(`遊戲結束。勝者是玩家 ${winner.id}，持有更多的牌。`);
    } else {
      console.log("遊戲意外結束，未達到正常的結束條件。");
    }
  }
  nextPlayer() {
    this.currentPlayerIndex = (this.currentPlayerIndex + 1) % this.players.length
  }
}
class Player {
  constructor(id) {
    this.id = id
    this.cards = [] // 玩家牌堆的牌
    this.tableCardsCount = 0
  }
}

module.exports = { Game, Player }