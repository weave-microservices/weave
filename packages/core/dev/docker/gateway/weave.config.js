const os = require('os')

module.exports = {
    nodeId: 'gateway-' + os.hostname(),
    transport: 'nats'
}
