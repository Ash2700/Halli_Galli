const checkHelper = require('../helpers/check-helpers')
const { User } = require('../models')
const bcrypt = require('bcrypt')
const jwt = require('jsonwebtoken')
const AppError = require('../helpers/appError')

const userService = {
  postRegister: req => {
    const { gameName, email, password, passwordCheck } = req.body
    // 檢查email password
    checkHelper.isExist(email, 'email must to be', 400)
    checkHelper.isExist(password, 'password must to be', 400)
    checkHelper.isSame(password, passwordCheck, 'passwordCheck must be same', 400)
    // 檢查email 是否存在
    return User.count({ where: { email } })
      .then(async count => {
        if (count) throw new Error('email have been ')
        const hash = await bcrypt.hash(password, 10)
        return User.create({ gameName, email, password: hash })
      })
      .then(user => {
        const data = user.toJSON()
        delete data.password
        return data
      })
      .catch(error => { throw error })
  },
  postLogin: req => {
    const { email, password } = req.body
    // 檢查
    checkHelper.isExist(email, 'email must to be', 400)
    checkHelper.isExist(password, 'password must to be', 400)
    User.findOne({ where: { email }, raw: true })
    .then(user => {
      const isSame = bcrypt.compare(password, user.password)
      if(user && isSame ){
        delete user.password
        const token = jwt.sign({user}, process.env.JWTSECRET, {expiresIn: '14d'})
        return {
          token,
          user
        }
      }else throw new AppError('account & password is wrong',400)
    })
  }
}

module.exports = userService
