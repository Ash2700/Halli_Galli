class Game {
  constructor(id) {
    this.id = id // 遊戲id
    this.players = [] // 存玩家訊息
    this.deck = [] // 牌推
    this.currentPlayerIndex = 0 // 目前進行玩家的索引
    this.inActive = false // 遊戲是否進行
    this.readyToStart = new Map()
  }
  addPlayer(player) {
    if (this.players.length < 6) {
      this.players.push(player)
      this.readyToStart.set(player.id,false)
      return true
    }
    return false
  }

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
  shuffleDeck() {
    for (let i = this.deck.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1))
      [this.deck[i], this.deck[j]] = [this.deck[j], this.deck[i]]
    }
  }
  setPlayerReady(playerId, isReady){
    if(this.readyToStart.has(playerId)){
      this.readyToStart.set(playerId, isReady)
      this.checkIfReadyToStart()
    }
  }
  checkIfReadyToStart(){
    const playerCount = this.players.length
    const AllAgreed = Array.from(this.readyToStart.values()).every(v => v === true)
    if(playerCount === 6 || (playerCount <5 && AllAgreed)){
      this.startGame()
    }
  }
  startGame(){
    
    this.isActive = true
    this.dealCards()
  }
  dealCards(playerCount){
    const playerCount = this.players.length
    const cardDistribution =  {2:28, 3:18, 4:14, 5:11, 6:9}
    const cardsToRemove = {2:0, 3:2 , 4:0, 5: 1, 6:2}
    // 移除指定數量的牌
    this.deck.splice(0, cardsToRemove[playerCount])
    // 定義發牌數量
    const cardCount = cardDistribution[playerCount]
    this.players.forEach(player =>{
      player.cards=[]
      for(let i= 0; i <cardCount; i++){
        if(this.deck.length>0){
          player.cards.push(this.deck.pop())
        }
      }
    })
  }

}

