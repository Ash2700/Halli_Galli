const express = require('express')
const bodyParser = require('body-parser')
const passport = require('./config/passport')
const app = express()
const router = express.Router()
app.use(bodyParser.urlencoded({extended: false}))
app.use(bodyParser.json())

app.use(router)

const PORT = process.env.PORT || 3000
app.listen(PORT, ()=>{
  console.log(`HALLI GALLI server on port ${PORT}`)
})

