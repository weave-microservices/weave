const Weave = require('../lib/index.js')
// Create broker #1
const adapters = require('../adapters')

const broker1 = Weave({
    nodeId: 'node-1',
    transport: adapters.Fake(),
    logger: console,
    logLevel: 'debug',
    preferLocal: false,
    registry: {}
})

broker1.createService({
    name: 'payment',
    events: {
        'user.created' () {
            this.log.info(this.broker.nodeId, ' - PAYMENT: Event received!')
        }
    }
})

broker1.createService({
    name: 'other',
    events: {
        'user.created': {
            group: 'payment',
            handler () {
                this.log.info(this.broker.nodeId, ' - OTHER: Event received!')
            }
        }
    }
})

broker1.createService({
    name: 'mail',
    events: {
        'user.created': {
            handler () {
                this.log.info(this.broker.nodeId, ' - MAIL: Event received!')
            }
        }
    }
})

// Create broker #2
const broker2 = Weave({
    nodeId: 'node-2',
    transport: adapters.Fake(),
    logger: console,
    registry: {}
})

broker2.createService({
    name: 'payment',
    events: {
        'user.created' () {
            this.log.info(this.broker.nodeId, ' - PAYMENT: Event received!')
        }
    }
})

broker2.createService({
    name: 'other',
    events: {
        'user.created': {
            group: 'payment',
            handler () {
                this.log.info(this.broker.nodeId, ' - OTHER: Event received!')
            }
        }
    }
})

broker2.createService({
    name: 'mail',
    events: {
        'user.created': {
            handler () {
                this.log.info(this.broker.nodeId, ' - MAIL: Event received!')
            }
        }
    }
})

Promise.all([
    broker1.start(),
    broker2.start()
]).then(() => {
    setInterval(() => {
        // broker1.broadcast('user.created', 'data')
        // broker1.broadcast('user.created', 'data')
        // broker1.broadcast('user.created', 'data', ['mail', 'payment'])
        broker1.log.info('-------------------------')
        // broker1.emit('user.created', 'data', ['payment'])
        broker1.emit('user.created', 'data')
    }, 1000)
})
