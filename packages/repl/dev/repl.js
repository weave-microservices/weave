const { Weave, TransportAdapters } = require('@weave-js/core')
const REPL = require('../lib/index')

const broker1 = Weave({
    nodeId: 'n1',
    transport: TransportAdapters.Fake(),
    preferLocal: false
})

const broker2 = Weave({
    nodeId: 'n2',
    transport: TransportAdapters.Fake(),
    preferLocal: false
})

broker1.createService({
    name: 'math',
    version: 2,
    actions: {
        add: {
            params: {
                num1: 'number',
                num2: 'number',
                addExtra: 'boolean'
            },
            handler (context) {
                // call return Promise.reject(new Error('ne'))
                return context.params.num1 + context.params.num2 + 100
            }
        }
    },
    events: {
        'user.created' () {
            console.log(this.schema.name, this.broker.nodeId)
        }   
    }
})

broker2.createService({
    name: 'math',
    actions: {
        add: {
            params: {
                num1: 'number',
                num2: 'number'
            },
            handler (context) {
                return context.params.num1 + context.params.num2
            }
        }
    },
    events: {
        'user.created' () {
            console.log(this.schema.name, this.broker.nodeId)
        }   
    }
})

broker2.createService({
    name: 'math2',
    actions: {
        add: {
            params: {
                num1: 'number',
                num2: 'number'
            },
            handler (context) {
                return context.params.num1 + context.params.num2
            }
        }
    },
    events: {
        'user.created' () {
            console.log(this.schema.name, this.broker.nodeId)
        }
    }
})

broker2.createService({
    name: 'greeter',
    actions: {
        sayHello: {
            params: {
                name: { type: 'string', optional: true }
            },
            handler (context) {
                return `Hello, ${context.params.name || 'stranger'}`
            }
        }
    }
})
broker1.start().then(() => REPL(broker1))
broker2.start()
