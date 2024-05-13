const roomManager = require('../helpers/roomManager')

describe('roomManager', () => {
  beforeAll(()=>{
    roomManager.rooms =[
      {id:1,
        name: '123',
        hostId: 'xxxx',
        players:[
          {id: 347,
            name: '234',
            readyToStart:true
          },
          {id: 3437,
            name: '2345',
            readyToStart:true
          },
          {id: 3427,
            name: '2344',
            readyToStart:true
          },
          {id: 3417,
            name: '2343',
            readyToStart:true
          },
          {id: 3447,
            name: '2342',
            readyToStart:true
          },
          {id: 3247,
            name: '2341',
            readyToStart:true
          },
        ]
      }
    ]
  })
  test('startGameProcess',()=>{
    roomManager.startGameProcess(1)
    
  })
})

