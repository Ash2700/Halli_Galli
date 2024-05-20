class MessageManager{
  constructor(){
    this.messages = []
  }

  addMessage(message){
    const maxLength =5
    if(this.messages.length ===maxLength) {
    this.messages.pop();
  }
    this.messages.unshift(message)
  }
  reverseMessage(message){
    this.messages.push(message)
  }

}
module.exports = MessageManager