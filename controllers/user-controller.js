const userService = require('../service/user-service')

const userController ={
postRegister: (req, res, next) =>{
  userService.postRegister(req)
  .then(data => res.status(200).json({
    status: 'success',
    data
  }))
  .catch(err => next(err))
},
postLogin: (req, res, next) => {
  userService.postLogin(req)
  .then(data => res.status(200).json({
    status: 'success',
    data
  }))
  .catch(error => next(error))
}
}
module.exports = userController