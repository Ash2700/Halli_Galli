const roomManager = require('./helpers/roomManager')

roomManager.rooms =[
  {id:1,
    name: '123',
    hostId: 'xxxx',
    players:[
      {id: 111,
        name: '234',
        readyToStart:true
      },
      {id: 222,
        name: '2345',
        readyToStart:true
      },
      {id: 333,
        name: '2344',
        readyToStart:true
      },
      {id: 444,
        name: '2343',
        readyToStart:true
      },
      {id: 555,
        name: '2342',
        readyToStart:true
      },
      
    ]
  }
]
roomManager.startGameProcess(1)
const data = roomManager.games.get(1)
// console.log(data)
// const trans = JSON.stringify(data)
// console.log(trans)
const mapTo = data.

console.log(mapTo)

