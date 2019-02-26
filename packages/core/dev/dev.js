const { WeaveNew } = require('../lib')

const stats = () => {

    return {
        created (broker) {
            this.log.info('hello framework')
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
        },
        call (next) {
            return function (actionName, params, opts) {
                console.log("The 'call' is called.", actionName)
                this.stats.callCounter++
                return next(actionName, params, opts).then(res => {
                    console.log("Response:", res)
                    return res
                })
            }
        }
    }
}

const app = WeaveNew({
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
        }
        // stats()
    ],
    // cache: false
    transport: 'redis'
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
    started () {
        // return Promise.reject(new Error('started'))
        this.timer = setInterval(() => {})
    },
    stopped () {
        this.log.debug(11)
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

app.loadServices(__dirname + '/services')

app.start()
    .then(() => {
        setInterval(() => {
            app.call('test.sayHello', { mu: Date.now() })
        }, 100)
    })
    // .then(res => app.log.info(res))
