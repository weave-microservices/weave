const { Weave, TransportAdapters } = require('../lib/index.js')
const DbMixin = require('./mixins/db.mixin')

const broker1 = Weave({
    nodeId: 'node-1',
    namespace: 'metric',
    transport: TransportAdapters.Fake()
})

const mixinLong = {
    started () {
        return new Promise(resolve => {
            setTimeout(() => {
                console.log('mixin Long')
                resolve()
            }, 5000)
        })
    },
    stopped () {
        console.log('m')
    }
}

broker1.createService({
    name: 'test',
    mixins: [mixinLong],
    actions: {
        hello: {
            handler (context) {
                return context.call('test.hello2')
            }
        },
        hello2: {
            handler (context) {
                return context.call('test.hello3')
            }
        },
        hello3: {
            handler (context) {
                return context.call('test.hello4')
            }
        },
        hello4: {
            handler (context) {
                return 'hello'
            }
        }
    },
    started () {
        console.log('service')
    },
    stopped () {
        console.log('s service')
    }
})

broker1.start()
