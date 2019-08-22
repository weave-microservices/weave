const { Weave, TransportAdapters } = require('@weave-js/core')
const WebGateway = require('../lib/index')
const path = require('path')

const broker = Weave({
    nodeId: 'web1',
    cache: false,
    logger: {
        logLevel: 'error'
    },
    transport: {
        adapter: TransportAdapters.Fake()
    },
    registry: {
        // preferLocalActions: true
    }
})

broker.createService({
    mixins: [WebGateway()],
    name: 'api',
    settings: {
        port: 81,
        routes: [
            {
                path: '/',
                aliases: {
                    'GET /': (request, response) => {
                        response.end('Welcome to my website!')
                    }
                }
            },
            {
                path: '/not',
                whitelist: ['test.*']
            }
        ]
    }
})

broker.start()
