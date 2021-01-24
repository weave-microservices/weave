
import { Transform } from 'stream'

export type PendingStore = {
    requests: Map<string, TransportRequest>,
    requestStreams: Map<string, Transform>,
    responseStreams: Map<string, Transform>
}
