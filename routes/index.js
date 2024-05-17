const express = require('express')
const router = express.Router()
const {Player} = require('../games/index')


const {v4: uuidv4} = require('uuid')
router.post('/enter',(req, res) => {
  const playerName = req.body.playerName
  const playerId = uuidv4()
  res.cookie('playerId', playerId).cookie('playerName',playerName)
  .redirect(`/lobby.html`)
})

const {errorHandler} = require('../middleware/error-handler')
router.use(errorHandler)

module.exports = router