const MessageManager = require('../helpers/messageManager')
const { v4: uuidv4 } = require('uuid')
class Game {
  constructor(data) {
    this.id = data.id || uuidv4() // 遊戲id
    this.players = data.players || [] // 存玩家訊息
    this.deck = data.deck || [] // 牌推
    this.currentPlayerIndex = data.currentPlayerIndex ?? -1 // 目前進行玩家的索引
    this.isActive = data.isActive || false // 遊戲是否進行
    this.tableCards = data.tableCards || []
    this.lastFlippedCards = data.lastFlippedCards || []
    this.messages = new MessageManager()
    if (data.messages) {
      data.messages.forEach(message => this.messages.reverseMessage(message))
    }
  }
  // 加入玩家
  addPlayer(player) {
    if (this.players.length < 6) {
      this.players.push(player)
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
  // 開始
  startGame() {
    if (this.players.length >= 2) {
      this.isActive = true
        this.messages.addMessage(`Game Start, 共有${this.players.length}名玩家參與`)
      this.initializeDeck()
      this.shuffleDeck()
      this.dealCards(this.players.length)
      this.nextPlayer()
    } else {
      this.messages.addMessage('不足最少玩家數,遊戲無法開始')
    }
  }
  // 玩家翻牌
  playCard(playerId) {
    if (!this.isActive) {
      this.messages.addMessage(`遊戲已結束`)
      return
    }
    const player = this.players.find(p => p.id === playerId)
    if (!player  || player.isFlipped) {
      return
    }
    if( player.cards.length === 0){
      this.nextPlayer()
    }
    const flippedCard = player.cards.shift()
    this.tableCards.push(flippedCard)
    player.tableCardsCount++
    this.lastFlippedCards[this.currentPlayerIndex] = flippedCard
    player.isFlipped = true
    this.updateTotal()
    this.nextPlayer()
  }
  checkPlayerCardDeck() {
    this.players = this.players.filter(player => {
      if (player.cards.length > 0 || player.tableCardsCount > 0) {
        return true // 手上 和 桌上還有牌
      } else {
        this.messages.addMessage(`玩家 ${player.id} 出局`)
        return false
      }
    })
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

  nextPlayer() {
    if(!this.isActive) return 
    this.checkPlayerCardDeck()
    this.currentPlayerIndex = (this.currentPlayerIndex + 1) % this.players.length
    const player = this.players[this.currentPlayerIndex]
    player.isFlipped = false
    //檢查
  }

  // 按鈴
  ringTheBell(playerId) {
    if (!this.isActive) {
      this.messages.addMessage(`遊戲已結束`)
      return
    }
    const resetCount = 0
    const isEqualFive = this.updateTotal(); // 更新並檢查是否達到5
    if (isEqualFive) {
      // 正確按鈴，收集桌面上的牌
      const player = this.players.find(p => p.id === playerId)
      player.cards.push(...this.tableCards);
      // 清空桌面的牌
      this.tableCards = []
      // 清空玩家面前的牌
      this.lastFlippedCards = [];
      // 清空玩家翻排的紀錄
      this.players.forEach(p => { p.tableCardsCount = resetCount })
      this.messages.addMessage(`玩家 ${player.name} 正確按鈴，收走了所有桌面上的牌。`)
      this.checkPlayerCardDeck()
      this.isGameContinue()
    } else {
      // 錯誤按鈴，給其他每個玩家一張牌作為懲罰
      const mistakePlayer = this.players.find(p => p.id === playerId)
      this.players.forEach(p => {
        if (p.id !== playerId && mistakePlayer.cards.length > 0) {
          p.cards.push(mistakePlayer.cards.pop());
        }
      })
      this.messages.addMessage(`玩家 ${playerId} 按錯了鈴，向每位玩家發了一張牌作為懲罰。`)
    }
  }
  // 出局

  checkPlayersDecks() {
    this.players = this.players.filter((player) => {
      if (player.cards.length > 0 || player.tableCardsCount > 0) {
        return true // 手上 和 桌上還有牌
      } else {
        this.messages.addMessage(`玩家 ${player.id} 出局`)
        return false
      }
    })
  }

  isGameContinue() {
    if (this.players.length === 2) {
      const [player1, player2] = this.players
      const totalCardsPlayer1 = player1.cards.length;
      const totalCardsPlayer2 = player2.cards.length;
      if (totalCardsPlayer1 !== totalCardsPlayer2) {
        const winner = totalCardsPlayer1 > totalCardsPlayer2 ? player1 : player2
        this.endGame(winner)
        return false
      }
      return true
    }
    return true
  }
  getMessages() {
    const messages = this.messages.messages
    return messages
  }
  // 遊戲結束
  endGame(winner) {
    this.isActive = false
    if (winner) {
      this.messages.addMessage(`遊戲結束。勝者是玩家 ${winner.id}，持有更多的牌。`)
    } else {
      this.messages.addMessage("遊戲意外結束，未達到正常的結束條件。")
    }
  }
  static fromJSON(data) {
    const game = JSON.parse(data)
    return new Game(game)
  }
}
class Player {
  constructor(id, name) {
    this.id = id
    this.name = name
    this.cards = [] // 玩家牌堆的牌
    this.tableCardsCount = 0
    this.isFlipped = false
  }
}
module.exports = { Game, Player }


