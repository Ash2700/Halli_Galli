const {Game } = require('./games/index')

const game = new Game(1)

game.lastFlippedCards.push({ fruit: 'Apple', num: 5 }, { fruit: 'Banana', num: 3 }, { fruit: 'Banana', num: 2 })
    const isTrue = game.updateTotal()

    console.log(isTrue)
