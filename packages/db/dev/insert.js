
const { Weave } = require('weave-core')
const WeaveDbMixin = require('../lib')

const broker = Weave({
    nodeId: 'populates - 1'
})

broker.createService({
    name: 'test',
    mixins: [WeaveDbMixin()],
    model: {
        name: 'tests'
    },
    docInserted (doc) {
        this.broker.log.info('erstellt!!!!', doc)
    }
})

broker.start()
    .then(() => {
        broker.call('test.insert', {
            entity: {
                name: 'kevin',
                date: Date.now()
            }
        })
    })
