const { EventEmitter } = require('events')
const http = require('http')
// const https = require('https')
const patchRequest = require('./request')
const patchResponse = require('./response')

module.exports = options => {
    const bus = new EventEmitter()
    let server

    if (options.http2) {
        try {
            const http2 = require('http2')
            server = http2.createServer(options.http2)
            patchRequest(http2.IncomingMessage)
            patchResponse(http2.OutgoingMessage)
        } catch (error) {}
    } else {
        if (options.http) {
            server = http.createServer(options.http)
        } else {
            server = http.createServer()
        }
        patchRequest(http.IncomingMessage)
        patchResponse(http.OutgoingMessage)
    }

    const setupRequest = (request, response) => {

    }

    const onRequest = (request, response) => {
        bus.emit('request', request)
        setupRequest(request, response)
    }

    server.on('request', onRequest)

    return {
        bus,
        server,
        listen () {
            const args = Array.from(arguments)
            return server.listen.apply(server, args)
        }
    }
}
