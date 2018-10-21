
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
    testsInserted () {
        this.broker.log('erstellt!!!!')
    }
})

broker.start()
    .then(() => {
        broker.call('test.count', { name: 'kevin' })
            .then(res => console.log(res))
    })
