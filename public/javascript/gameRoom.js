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
function updateCardArea(length, n1, n2, n3) {
  let sentence = ''
  const element= `<div class="col" style="max-height: 33%;"><img src="/img/cropped_card_design.png" class="img-thumbnail" alt="card-back"></div>`
  if (length >= n1) { sentence += element }
  if (length >= n2) { sentence += element }
  if (length >= n3) { sentence += element }
  console.log(sentence)
  return sentence
}
function updateFlippedArea(n1, n2, n3, cardDatas) {
  let sentence =''
  cardDatas.forEach((data,index) => {
    const element = `<div class="col my-3" style="max-height: 33%;">
    <div class="flipped-card border d-flex flex-column justify-content-between" style="height: 21vh;">
        <div style="text-align: left;" class="m-2">${data.num}</div>
        <div style="text-align: center;">${data.fruit}</div>
        <div style="text-align: right;" class="m-2">${data.num}</div></div></div>` 
    if (index === n1) { sentence += element }
    if (index === n2) { sentence += element }
    if (index === n3) { sentence += element }
  })
  console.log(sentence)
  return sentence
  
}

document.addEventListener('DOMContentLoaded', () => {
  const socket = io()
  socket.on('connect', () => {
    console.log(`connected room:${roomId},${socket.connected}`)
    socket.emit('test', roomId)
  })
  if (!socket.connected) { }
  socket.on('disconnect', () => {
    socket.emit('leaveRoom', { roomId, playerId })
  })
  // 玩家準備好
  document.getElementById('ready-button').addEventListener('click', () => {
    socket.emit('playerReady', { playerId, roomId })
  })

  const gameArea = document.getElementById('game-space')
  socket.on('updateTheRoom', ((length, cardData) => {
    
  }))
  
  // test
    gameArea.addEventListener('click',() =>{
      socket.emit('dosomething',roomId)
    })
  

  socket.on('updateTheGame', (length,cardData)=> {
    const cardDeck1 = updateCardArea(length, 1, 3, 5)
    const cardDeck2 = updateCardArea(length, 2, 4, 6)
    const flipped1 = updateFlippedArea(0, 2, 4,cardData)
    const flipped2 = updateFlippedArea( 1, 3, 5, cardData)
    console.log(cardDeck1)
    console.log(flipped1)
    gameArea.innerHTML = `<div class ="row"><div class="card-deck col text-center border  ">
    <div class="row row-cols-1 ">
      ${cardDeck1}
    </div>
</div>
<!-- 翻開卡片 -->
<div class="flipped-card col text-center border">
    <div class="row row-cols-1 ">
        ${flipped1}
    </div>
</div>
<div class="bell-area col text-center border align-self-center">
    <div>
        <img src="/img/bell.png" class="img-thumbnail" alt="bell" id="bell">
    </div>
</div>
<div class="flipped-card col text-center border">
<div class="row row-cols-1 ">
${flipped2}
</div>
</div>
<div class="card-deck col text-center border">
<div class="row row-cols-1 ">
${cardDeck2}
</div>
</div>
</div>`
  })

  socket.on('startGame', (gamePlayersCount) => {
    // 根據人數更新遊戲畫面

    console.log(gameData)
    console.log('hi')
    // 顯示換面和通知
  })
  socket.on('testback', () => {
    console.log('1')
  })
})