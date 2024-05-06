const express = require('express')
const router = express.Router()
const users = require('./models/users')
const userController = require('../controllers/user-controller')
const {Player} = require('../games/index')

router.use('/users', users)
router.post('/register', userController.postRegister)
router.post('/login', userController.postLogin)

const {v4: uuidv4} = require('uuid')
router.post('/enter',(req, res) => {
  const playerName = req.body.playerName
  const playerId = uuidv4()
  res.cookie('playerId', playerId).cookie('playerName',playerName)
  .redirect(`/lobby.html`)
})

router.use('/', (req, res, next) => {
  res.json({
    status: 'fail',
    message: 'not find'
  })
  next()
})


const {errorHandler} = require('../middleware/error-handler')
router.use(errorHandler)

module.exports = router