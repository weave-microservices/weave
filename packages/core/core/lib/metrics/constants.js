// Process
exports.PROCESS_PID = 'process.pid'
exports.PROCESS_PPID = 'process.ppid'
exports.PROCESS_UPTIME = 'process.uptime'

// Service broker
exports.WEAVE_ENVIRONMENT = 'weave.environment'
exports.WEAVE_ENVIRONMENT_VERSION = 'weave.environment-version'
exports.WEAVE_VERSION = 'weave.version'
exports.WEAVE_NODE_ID = 'weave.node-id'
exports.WEAVE_NAMESPACE = 'weave.namespace'

// Services
exports.REQUESTS_TOTAL = 'weave.requests.total'
exports.REQUESTS_IN_FLIGHT = 'weave.requests.in-flight'
exports.REQUESTS_ERRORS_TOTAL = 'weave.requests.errors.total'
exports.REQUESTS_TIME = 'weave.requests.time'

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
exports.BULKHEAD_REQUESTS_IN_FLIGHT = 'weave.bulkhead.requests.in-flight'

// OS Metrics
exports.OS_HOSTNAME = 'os.hostname'
exports.OS_TYPE = 'os.type'
exports.OS_RELEASE = 'os.release'
exports.OS_ARCH = 'os.architecture'
exports.OS_PLATTFORM = 'os.plattform'
exports.OS_MEMORY_FREE = 'os.memory.free'
exports.OS_MEMORY_USED = 'os.memory.used'
exports.OS_MEMORY_TOTAL = 'os.memory.total'
exports.OS_UPTIME = 'os.uptime'
exports.OS_USER_UID = 'os.user.uid'
exports.OS_USER_GID = 'os.user.gid'
exports.OS_USER_USERNAME = 'os.user.username'
exports.OS_USER_HOMEDIR = 'os.user.homedir'

exports.OS_CPU_LOAD_1 = 'os.cpu-load.1'
exports.OS_CPU_LOAD_5 = 'os.cpu-load.5'
exports.OS_CPU_LOAD_15 = 'os.cpu-load.15'

// Cache
exports.CACHE_GET_TOTAL = 'weave.cache.items.get'
exports.CACHE_SET_TOTAL = 'weave.cache.items.set'
exports.CACHE_DELETED_TOTAL = 'weave.cache.items.deleted'
exports.CACHE_FOUND_TOTAL = 'weave.cache.items.found'
exports.CACHE_CLEANED_TOTAL = 'weave.cache.items.cleaned'
exports.CACHE_EXPIRED_TOTAL = 'weave.cache.items.expired'
