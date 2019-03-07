const { Weave } = require('../lib')

const stats = () => {
    return {
        created (broker) {
            this.log.info('hello framework')
        },
        stopped (broker) {
            this.log.info('goodbye 😢')
        },
        starting (a) {
            this.stats = {
                callCounter: 0
            }
        },
        createService (next) {
            return function (schema) {
                return next(schema)
            }
        }
    }
}

const app = Weave({
    // nodeId: 'sdasd',
    logLevel: 'debug',
    watchServices: true,
    middlewares: [
        {
            localAction: function (handler, action) {
                // if (action.name === 'file.get') {
                //     return (context) => {
                //         return handler(context)
                //     }
                // }
                return handler
            }
        },
        stats()
    ],
    metrics: {
        enabled: true
    }
    // cache: true,
    // transport: 'redis'
})

const app2 = Weave({
    // nodeId: 'sdasd',
    logLevel: 'debug',
    watchServices: true,
    metrics: {
        enabled: true
    }
    // cache: true,
    // transport: 'redis'
})

const mixin = {
    events: {
        'event.called' () {
            this.log.info('event' + this.name)
        },
        'event.broadcasted' () {
            this.log.info('broadcasted' + this.name)
        },
        '$broker.stopped' () {
            this.log.info('Broker stopped')
        }
    }
}

app.createService({
    name: 'test',
    dependencies: ['formater'],
    mixins: [mixin],
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
    started () {
        this.timer = setInterval(() => {})
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
    mixins: [mixin],
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
    mixins: [mixin],
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

app.log.debug('sdasdas')

// const appContext = async (w) => {
//     const res = await app.call('test.sayHello')
//     const he = app.health.getNodeHealthInfo()
//     app.log.debug(res)
// }

Promise.all([
    app.start(),
    app2.start()
]).then(() => {
    setInterval(() => {
        app.call('test.sayHello', { mu: 124 })
    }, 2000)
})
