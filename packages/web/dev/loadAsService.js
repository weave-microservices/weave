const { Weave } = require('@weave-js/core')
const ApiMixin = require('@weave-js/web')

const broker = Weave()

// Create a service
broker.createService({
    name: 'test',
    actions: {
        hello () {
            return 'Hello API Gateway!'
        }
    }
})

// Load API Gateway
broker.createService(ApiMixin())
// Start server
broker.start()
