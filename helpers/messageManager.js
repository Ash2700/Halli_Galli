class MessageManager{
  constructor(){
    this.messages = []
  }

  addMessage(message){
    const maxLength =10
    if(this.messages.length ===maxLength){
      this.messages.pop()
    }
    this.messages.unshift(message)
  }

}
module.exports = MessageManager