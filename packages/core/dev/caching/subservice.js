const { Weave, TransportAdapters } = require('../../lib/index.js')

// Create broker #1

const broker1 = Weave({
    transport: TransportAdapters.Fake(),
    logger: console,
    logLevel: 'debug',
    preferLocal: false,
    cache: true,
    registry: {
        // preferLocal: false
    }
})

broker1.createService({
    name: 'user',
    actions: {
        getName: {
            cache: {
                keys: ['id']
            },
            params: {
                id: { type: 'string' }
            },
            handler (context) {
                return Promise.all([
                    context.call('firstname.get', { name: 'Kevin' }),
                    context.call('lastname.get', { name: 'Ries' })
                ])
            }
        }
    }
})

broker1.createService({
    name: 'firstname',
    actions: {
        get: {
            cache: {
                keys: ['name']
            },
            params: {
                name: { type: 'string' }
            },
            handler (context) {
                return context.params.name
            }
        }
    }
})

broker1.createService({
    name: 'lastname',
    actions: {
        get: {
            cache: {
                keys: ['name']
            },
            params: {
                name: { type: 'string' }
            },
            handler (context) {
                return context.params.name
            }
        }
    }
})

// Create broker #2
const broker2 = Weave({
    nodeId: 'node-2',
    transport: TransportAdapters.Fake(),
    logger: console,
    cache: true,
    registry: {
        // preferLocal: false
    }
})

Promise.all([
    broker1.start(),
    broker2.start()
]).then(() => {
    setInterval(() => {
        const p = broker1.call('user.getName', { id: '2' })
        p.then(result => broker1.log.info(result))
            .catch(error => broker1.log.warn(error))
    }, 500)
})
