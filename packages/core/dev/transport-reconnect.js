const { Weave } = require('../lib')
const path = require('path')

const app = Weave({
    nodeId: 'node1',
    logLevel: 'info',
    watchServices: true,
    metrics: {
        enabled: true
    },
    // cache: true,
    transport: 'redis'
})

app.createService({
    name: 'test',
    dependencies: ['formater'],
    actions: {
        sayHello: {
            cache: {
                keys: ['mu']
            },
            params: {
                mu: { type: 'number' }
            },
            handler (context) {
                context.emit('event.called')
                return context.call('test1.sayHello', { a: 10000000 })
            }
        }
    },
    events: {
        'metrics.trace.span.finished' (data) {
            if (data.isCachedResult) {
                console.log(data)
            }
        }
    },
    stopped () {
        return new Promise((resolve, reject) => {
            setTimeout(() => {
                reject('alles klar')
            }, 4000)
        })
    }
})

app.createService({
    name: 'test1',
    actions: {
        sayHello (context) {
            context.broadcast('event.broadcasted')
            return 213423 + context.params.a
        }
    },
    started () {
        // return Promise.reject(new Error('started'))
        // this.timer = setInterval(() => {})
    },
    stopped () {
        this.log.debug(11)
    }
})

app.createService({
    name: 'test2',
    actions: {
        sayHello (context) {
            context.emit('event.called')
            return '3234234'
        }
    },
    started () {
        return new Promise(resolve => {
            setTimeout(() => resolve(), 2000)
        })
        // return Promise.reject(new Error('started'))
        // this.timer = setInterval(() => {})
    },
    stopped () {
        this.log.debug(11)
    }
})

app.loadServices(path.join(__dirname, '/services'))

Promise.all([
    app.start()
])
