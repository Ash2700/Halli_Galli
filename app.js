require('dotenv').config()

const express = require('express')
const app = express()

const http = require('http')
const server = http.createServer(app)

const socketManager = require('./socket/socketManager')
socketManager.init(server)

const bodyParser = require('body-parser')
app.use(bodyParser.urlencoded({ extended: false }))
app.use(bodyParser.json())

const path = require('path')
app.use(express.static(path.join(__dirname, 'public')))

const router = require('./routes')
app.use(router)

const { errorHandler } = require('./middleware/error-handler')
app.use(errorHandler)

const client = require('./helpers/redis')
async function clearOldData() {
  try {
    await client.del('rooms')
    await client.del('games')
  } catch (error) {
    console.error('Error clearing old data:', error)
  }

}

clearOldData().then(() => {
  const PORT = process.env.PORT || 3000
  server.listen(PORT, () => {
    console.log(`HALLI GALLI server on port ${PORT}`)
  })
})
module.exports = app