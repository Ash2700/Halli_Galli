const sessionID = localStorage.getItem("sessionID")
const playerId = localStorage.getItem("playerId")
const playerName = localStorage.getItem("playerName")
const roomId = localStorage.getItem('joinRoom') ? localStorage.getItem('joinRoom') : null

document.getElementById('show-id').innerHTML = playerId
document.getElementById('show-name').innerHTML = playerName
document.getElementById('show-roomId').innerHTML = roomId

function updateCardArea(players, playerIndex) {
  let deckLeft = ''
  let deckRight = ''
  players.forEach((player, index) => {
    const addWord = (index === Number(playerIndex)) ? 'selected' : ''
    const element =
      `<div class="col card-deck ${addWord} position-relative" id=${player.id} style="max-height: 33%;">
      <img src="/img/cropped_card_design.png" class="img-thumbnail" alt="card-back">
        <span class="position-absolute top-0 start-100 translate-middle badge rounded-pill bg-danger">
    ${player.cards.length}
        </span>
        <span class="position-absolute bottom-0 start-100 translate-middle  rounded-pill badge bg-info text-dark">
    ${player.name}
        </span>
    </div>`
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
    if (card) {
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
    }
  })
  return [flipLeft, flipRight]
}

document.addEventListener('DOMContentLoaded', () => {
  const socket = io()
  socket.auth = { sessionID, roomId }
  socket.on('connect', () => {
    console.log(`connect room: NO.${roomId}`, playerName)
    socket.emit('updateTheRoom')
  })

  socket.on('disconnect', () => {
  })
  // socket.emit('leaveRoom', { roomId, playerId })

  // 玩家準備好
  document.getElementById('ready-button').addEventListener('click', () => {
    socket.emit('playerReady')
  })
  document.getElementById('leave-button').addEventListener('click', () => {
    socket.emit('leave-room')
  })
  socket.on('leaveRoomResponse', () => {
    localStorage.setItem('joinRoom', null)
    window.location.href = `/lobby.html`
  })
  const gameArea = document.getElementById('game-space')
  socket.on('updateTheGame', (players, cards, index,isActiveGame) => {
    const cardDeck = updateCardArea(players, index)
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
    bell.addEventListener('click', () => {
      socket.emit('ringTheBell', roomId, playerId)
    })
    //遊戲結束 跳出視窗確認去留
    if (!isActiveGame) {
      showExitPrompt();
    }
  })
  function showExitPrompt() {
    const userChoice = confirm("遊戲已結束。你想要離開房間還是留下來？按確定離開，按取消留下來。");
    if (userChoice) {
      // 用戶選擇離開房間，重定向回大廳
      socket.emit('leave-room')
    } else {
      // 用戶選擇留下來，初始化房間狀況
      socket.emit('initializeRoom')
    }
  }
  const playerList = document.getElementById('players-list')

  function renderPlayerList(players) {
    let content = ''
    players.forEach(player => {
      content += `<ul class="list-group list-group-horizontal">
            <li class="list-group-item w-75 fs-6"> ${player.name} </li>
            <li class="list-group-item w-25 fs-6">${player.readyToStart}<li>
            </ul>`
    })
    let fixWord = `<ul class="list-group list-group-horizontal">
          <li class="list-group-item w-75 fs-6"> Name</li>
          <li class="list-group-item w-25 fs-6"> Status</li></ul>${content}`

    return fixWord
  }

  // 更新房間的玩家清單
  socket.on('renderPlayerList', players => {
    console.log(players)
    if (!players) return
    const content = renderPlayerList(players)
    playerList.innerHTML = content
  })

  function renderMessage(messages) {
    if (!messages) return
    let result = ''
    messages.forEach(msg => {
      const element = `<p class = "fs-6">gameInfo: <span>${msg}</span></p>`
      result += element
    })
    return result
  }

  const message = document.getElementById('game-message')
  socket.on('renderMessage', messages => {
    const renderContent = renderMessage(messages)
    message.innerHTML = renderContent
  })

  socket.on('connect_error', (err) => {
    console.log(err)
  })
})