const { Weave } = require('@weave-js/core')

// Create broker #1
const broker1 = Weave({
    nodeId: 'node-1',
    logger: console,
    logLevel: 'debug',
    preferLocal: false,
    requestTimeout: 2000,
    registry: {
        // preferLocal: false
    }
})

broker1.createService({
    name: 'test',
    actions: {
        action1: {
            params: {
                name: { type: 'string' }
            },
            async handler (context) {
                await context.call('test.action2').then(() => {})
                console.log(context.meta)
            }
        },
        action2: {
            params: {
                name: { type: 'string' }
            },
            handler (context) {
                context.meta.test = 1
            }
        }
    }
})

broker1.start()
    .then(() => {
        broker1.call('test.action1')
    })
