const Gauge = require('./gauge')

module.exports = class Counter extends Gauge {
    constructor (store, obj) {
        super(store, obj)
    }

    decrement () {
        throw new Error('Not allowed to decrement a counter')
    }
}
