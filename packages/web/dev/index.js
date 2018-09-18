const Weave = require('weave-core')
const WebGateway = require('../src/index')

const broker = Weave({
    nodeId: 'web1'
})

broker.createService({
    name: 'test',
    actions: {
        hello: {
            handler (context) {
                return 'hello from weave'
            }
        }
    }
})

broker.createService({
    mixins: [WebGateway],
    settings: {
        routes: [
            {
                path: '/hello',
                aliases: {
                    'GET /world': '$node.actions'
                }
            }
        ]
    }
})

broker.start()
