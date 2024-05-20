const express = require('express')
const router = express.Router()


router.get('/',(res,req, next) => {
  req.redirect('/index.html')
})

module.exports = router