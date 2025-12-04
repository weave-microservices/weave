// Process
export const PROCESS_PID = "process.pid";
export const PROCESS_PPID = "process.ppid";
export const PROCESS_UPTIME = "process.uptime";

// Service broker
export const WEAVE_ENVIRONMENT = "weave.environment";
export const WEAVE_ENVIRONMENT_VERSION = "weave.environment-version";
export const WEAVE_VERSION = "weave.version";
export const WEAVE_NODE_ID = "weave.node-id";
export const WEAVE_NAMESPACE = "weave.namespace";

// Services
export const REQUESTS_TOTAL = "weave.requests.total";
export const REQUESTS_IN_FLIGHT = "weave.requests.in-flight";
export const REQUESTS_ERRORS_TOTAL = "weave.requests.errors.total";
export const REQUESTS_TIME = "weave.requests.time";

// Events
export const EVENT_TOTAL_EMITS = "weave.events.total-emits";
export const EVENT_TOTAL_BROADCASTS = "weave.events.total-broadcasts";
export const EVENT_TOTAL_BROADCASTS_LOCAL = "weave.events.total-broadcasts-local";
export const EVENT_TOTAL_RECEIVED = "weave.events.total-received";

// Transporter
export const TRANSPORT_RECONNECTS = "weave.transport.reconnects";
export const TRANSPORTER_PACKETS_SENT = "weave.transport.packets.sent";
export const TRANSPORTER_PACKETS_RECEIVED = "weave.transport.packets.received";
export const TRANSPORT_IN_FLIGHT_STREAMS = "weave.transport.streams.in-flight";

// Bulkhead
export const BULKHEAD_REQUESTS_IN_FLIGHT = "weave.bulkhead.requests.in-flight";

// OS Metrics
export const OS_HOSTNAME = "os.hostname";
export const OS_TYPE = "os.type";
export const OS_RELEASE = "os.release";
export const OS_ARCH = "os.architecture";
export const OS_PLATTFORM = "os.plattform";
export const OS_MEMORY_FREE = "os.memory.free";
export const OS_MEMORY_USED = "os.memory.used";
export const OS_MEMORY_TOTAL = "os.memory.total";
export const OS_UPTIME = "os.uptime";
export const OS_USER_UID = "os.user.uid";
export const OS_USER_GID = "os.user.gid";
export const OS_USER_USERNAME = "os.user.username";
export const OS_USER_HOMEDIR = "os.user.homedir";

export const OS_CPU_LOAD_1 = "os.cpu-load.1";
export const OS_CPU_LOAD_5 = "os.cpu-load.5";
export const OS_CPU_LOAD_15 = "os.cpu-load.15";

// Cache
export const CACHE_GET_TOTAL = "weave.cache.items.get";
export const CACHE_SET_TOTAL = "weave.cache.items.set";
export const CACHE_DELETED_TOTAL = "weave.cache.items.deleted";
export const CACHE_FOUND_TOTAL = "weave.cache.items.found";
export const CACHE_CLEANED_TOTAL = "weave.cache.items.cleaned";
export const CACHE_EXPIRED_TOTAL = "weave.cache.items.expired";
