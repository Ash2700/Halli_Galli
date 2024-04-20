const express = require('express')
const router = express.Router()
const users = require('./models/users')
const userController = require('../controllers/user-controller')

router.use('/users', users)
router.post('/register', userController.postRegister)
router.post('/login', userController.postLogin)


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