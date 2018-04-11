const EventEmitter2 = require('eventemitter2')

const busFactory = () => {
    return new EventEmitter2({
        wildcard: true,
        maxListeners: 1000
    })
}

module.exports = busFactory
