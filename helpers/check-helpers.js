const AppError = require('../helpers/appError')
const checkHelper ={
  isExist : (checkItem, errMessage= '', statusCode) =>{
    if(checkItem) return 
    else throw new AppError(errMessage, statusCode)
  },
  isSame: (item1, item2, errMessage= '',statusCode)=> {
    if(item1 === item2 ) return 
    else throw new AppError(errMessage, statusCode)
  },
  isType: (checkItem, checkType) => {
    if(typeof(checkItem === checkType)){
      return true
    }
    return false
  }
}
module.exports = checkHelper