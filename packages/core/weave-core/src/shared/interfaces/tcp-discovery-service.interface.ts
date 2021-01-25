import { EventEmitter} from 'events'

export interface TCPDiscoveryService {
  bus: EventEmitter,
  init(port: number): Promise<any>,
  close(): void
}