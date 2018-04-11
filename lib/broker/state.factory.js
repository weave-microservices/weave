const stateFactory = ({ pkg, createId }) =>
    options => {
        const broker = Object.create(null)

        broker.options = options
        broker.nodeId = options.nodeId || createId()
        broker.version = pkg.version
        broker.services = []
        broker.middlewares = []
        broker.started = false
        broker.waitForServiceInterval = null
        broker.actionCount = 0

        return broker
    }

module.exports = stateFactory
