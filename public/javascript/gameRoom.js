const playerId = getCookie('playerId')
const playerName = getCookie('playerName')

document.getElementById('show-id').innerHTML = playerId
document.getElementById('show-name').innerHTML = playerName
const urlParams = new URLSearchParams(window.location.search)
const roomId = urlParams.get('roomId')
document.getElementById('show-roomId').innerHTML = roomId
function getCookie(name) {
  const value = `; ${document.cookie}`;
  const parts = value.split(`; ${name}=`);
  if (parts.length === 2) return parts.pop().split(';').shift();
}
function updateCardArea(players) {
  let deckLeft = ''
  let deckRight = ''
  players.forEach((player, index) => {
    const element = `<div class="col" id=${player.id} style="max-height: 33%;"><img src="/img/cropped_card_design.png" class="img-thumbnail" alt="card-back"></div>`
    switch (index) {
      case 0:
        deckLeft += element
        break
      case 2:
        deckLeft += element
        break
      case 4:
        deckLeft += element
        break
      case 1:
        deckRight += element
        break
      case 3:
        deckRight += element
        break
      case 5:
        deckRight += element
        break

    }
  })
  return [deckLeft, deckRight]
}
function updateFlipArea(cards) {
  let flipLeft = ''
  let flipRight = ''
  cards.forEach((card, index) => {
    const element = `<div class="col my-3" style="max-height: 33%;">
    <div class="flipped-card border d-flex flex-column justify-content-between" style="height: 21vh;">
        <div style="text-align: left;" class="m-2">${card.num}</div>
        <div style="text-align: center;">${card.fruit}</div>
        <div style="text-align: right;" class="m-2">${card.num}</div></div></div>`
    switch (index) {
      case 0:
        flipLeft += element
        break
      case 2:
        flipLeft += element
        break
      case 4:
        flipLeft += element
        break
      case 1:
        flipRight += element
        break
      case 3:
        flipRight += element
        break
      case 5:
        flipRight += element
        break

    }
  })
  return [flipLeft, flipRight]
}

document.addEventListener('DOMContentLoaded', () => {
  const socket = io()
  socket.on('connect', () => {
    console.log(`connected room:${roomId},${socket.connected}`)
  })

  socket.on('disconnect', () => {
    socket.emit('leaveRoom', { roomId, playerId })
  })

  // 玩家準備好
  document.getElementById('ready-button').addEventListener('click', () => {
    socket.emit('playerReady', { playerId, roomId })
  })

  socket.on('updateTheRoom', ((length, cardData) => {
    console.log('here')
  }))

  const gameArea = document.getElementById('game-space')
  socket.on('updateTheGame', (players, cards) => {
    const cardDeck = updateCardArea(players)
    const flipped = updateFlipArea(cards)
    gameArea.innerHTML = `<div class="card-deck col text-center border  ">
    <div class="row row-cols-1 ">
      ${cardDeck[0]}
    </div>
</div>
<!-- 翻開卡片 -->
<div class="flipped-card col text-center border">
    <div class="row row-cols-1 ">
        ${flipped[0]}
    </div>
</div>
<div class="bell-area  col text-center border align-self-center" id="bell">
    <div>
        <img src="/img/bell.png" class="img-thumbnail" alt="bell" id="bell">
    </div>
</div>
<div class="flipped-card col text-center border">
<div class="row row-cols-1 ">
${flipped[1]}
</div>
</div>
<div class="card-deck col text-center border">
<div class="row row-cols-1 ">
${cardDeck[1]}
</div>
</div>
`
    // 在更新innerHTML後綁定事件處理器
    const flipDeck = document.getElementById(`${playerId}`)

    flipDeck.addEventListener('click', () => {
      socket.emit('flipCard', roomId, playerId)
    })

    //再更新後綁定
    const bell = document.getElementById('bell')
    bell.addEventListener('click',() => {
      socket.emit('ringTheBell', roomId, playerId)
    })
  })

})