const express = require('express')
const router = express.Router()
const users = require('./models/users')
const checkHelper = require('../helpers/check-helpers')
const userController = require('../controllers/user-controller')

router.use('/users', users)
router.post('/register', userController.postRegister)
router.post('/login', userController.postLogin)



module.exports = router