
import { Transform } from 'stream'
import { TransportRequest } from '../interfaces/transport-request.interace'

export type PendingStore = {
    requests: Map<string, TransportRequest>,
    requestStreams: Map<string, Transform>,
    responseStreams: Map<string, Transform>
}
