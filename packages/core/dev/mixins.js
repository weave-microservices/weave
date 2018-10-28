const { Weave, TransportAdapters } = require('../lib/index.js')
const DbMixin = require('./mixins/db.mixin')

const broker1 = Weave({
    nodeId: 'node-1',
    namespace: 'metric',
    transport: TransportAdapters.Fake()
})

broker1.createService({
    name: 'test',
    mixins: [DbMixin({})],
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
        console.log(this)
    }
})

broker1.start()
