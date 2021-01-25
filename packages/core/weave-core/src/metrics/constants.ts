// Service broker
export const WEAVE_ENVIRONMENT = 'weave.environment'
export const WEAVE_VERSION = 'weave.version'
export const WEAVE_NODE_ID = 'weave.node-id'
export const WEAVE_NAMESPACE = 'weave.namespace'

// Services
export const REQUESTS_TOTAL = 'weave.requests.total'
export const REQUESTS_IN_FLIGHT = 'weave.requests.in-flight'
export const REQUESTS_ERRORS_TOTAL = 'weave.requests.errors.total'

// Events
export const EVENT_TOTAL_EMITS = 'weave.events.total-emits'
export const EVENT_TOTAL_BROADCASTS = 'weave.events.total-broadcasts'
export const EVENT_TOTAL_BROADCASTS_LOCAL = 'weave.events.total-broadcasts-local'
export const EVENT_TOTAL_RECEIVED = 'weave.events.total-received'

// Transporter
export const TRANSPORT_RECONNECTS = 'weave.transport.reconnects'
export const TRANSPORTER_PACKETS_SENT = 'weave.transport.packets.sent'
export const TRANSPORTER_PACKETS_RECEIVED = 'weave.transport.packets.received'
export const TRANSPORT_IN_FLIGHT_STREAMS = 'weave.transport.streams.in-flight'

// Bulkhead
export const REQUESTS_BULKHEAD_IN_FLIGHT = 'weave.requests.bulkhead.in-flight'
