const { Weave } = require('@weave-js/core')
const WebGateway = require('../lib/index')

const broker = Weave({
    nodeId: 'web1'
})

broker.createService({
    name: 'test',
    actions: {
        hello: {
            handler (context) {
                return 'hello from weave'
            }
        }
    }
})

broker.createService({
    mixins: [WebGateway],
    settings: {
        routes: [
            {
                path: '/not',
                whitelist: ['test.*']
            },
            {
                path: '/',
                whitelist: ['test.*'],
                rateLimit: {
                    headers: true,
                    limit: 10
                }
            }
        ]
    }
})

broker.createService({
    name: 'test',
    version: 2,
    actions: {
        post (context) {
            context.meta.responseHeader = 'asdasd'
            return new Promise(resolve => {
                setTimeout(() => resolve('sdasdasdas'), 1000)
            })
        }
    }
})

broker.createService({
    name: 'test',
    version: 1,
    actions: {
        post (context) {
            return Promise.reject(new Error('sdasd'))
        }
    }
})
broker.start()
