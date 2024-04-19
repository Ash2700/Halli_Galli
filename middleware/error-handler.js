const AppError = require('../helpers/appError')

module.exports = {
  errorHandler(err, req, res, next){
    err.statusCode = err.statusCode || 500
    err.status = err.status || 'error'
    if(err instanceof Error) err.message = `${err.name} : ${ err.message}`
    else err.message = `${err}`

    res.status(err.statusCode).json({
      status: err.status,
      message: err.message
    })
    next(err)
  }
}