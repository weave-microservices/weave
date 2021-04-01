// Service broker
exports.WEAVE_ENVIRONMENT = 'weave.environment'
exports.WEAVE_VERSION = 'weave.version'
exports.WEAVE_NODE_ID = 'weave.node-id'
exports.WEAVE_NAMESPACE = 'weave.namespace'

// Host

// Services
exports.REQUESTS_TOTAL = 'weave.requests.total'
exports.REQUESTS_IN_FLIGHT = 'weave.requests.in-flight'
exports.REQUESTS_ERRORS_TOTAL = 'weave.requests.errors.total'

// Events
exports.EVENT_TOTAL_EMITS = 'weave.events.total-emits'
exports.EVENT_TOTAL_BROADCASTS = 'weave.events.total-broadcasts'
exports.EVENT_TOTAL_BROADCASTS_LOCAL = 'weave.events.total-broadcasts-local'
exports.EVENT_TOTAL_RECEIVED = 'weave.events.total-received'

// Transporter
exports.TRANSPORT_RECONNECTS = 'weave.transport.reconnects'
exports.TRANSPORTER_PACKETS_SENT = 'weave.transport.packets.sent'
exports.TRANSPORTER_PACKETS_RECEIVED = 'weave.transport.packets.received'
exports.TRANSPORT_IN_FLIGHT_STREAMS = 'weave.transport.streams.in-flight'

// Bulkhead
exports.REQUESTS_BULKHEAD_IN_FLIGHT = 'weave.requests.bulkhead.in-flight'
