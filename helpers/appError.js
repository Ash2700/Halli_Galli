class AppError extends Error{
  constructor(message, statusCode){
    super(message)
    this.statusCode = statusCode || 500
    this.status = `${statusCode}`.startsWith('4') ? 'fail' : 'error'
    this.isOperational = true
    // 抓取錯誤的位置
    Error.captureStackTrace(this, this.constructor)
  }
}

module.exports = AppError