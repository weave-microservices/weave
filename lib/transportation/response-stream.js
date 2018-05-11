/*
 * Author: Kevin Ries (kevin@fachw3rk.de)
 * -----
 * Copyright 2018 Fachwerk
 */

const DuplexStream = require('stream').Duplex

class DataStream extends DuplexStream {
    constructor (options) {
        super(options)
        this.buffer = []
    }

    _write (item, encoding, callback) {
        this.buffer.push(new Buffer(JSON.stringify(item)))
        callback()
    }

    _read (n) {
        const currentBuffer = this.buffer.pop()
        if (typeof currentBuffer === 'undefined') {
            this.push(null)
        } else {
            this.push(currentBuffer)
        }
    }
}

module.exports = DataStream
