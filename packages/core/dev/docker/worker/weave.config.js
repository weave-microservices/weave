const os = require('os')

module.exports = {
    nodeId: 'worker-' + os.hostname(),
    transport: 'nats'
}
