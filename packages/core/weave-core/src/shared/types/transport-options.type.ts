export type TransportOptions = {
  adapter?: null,
  serializer?: Function,
  maxQueueSize: number,
  heartbeatInterval: number,
  nodeUpdateInterval: number,
  heartbeatTimeout: number,
  offlineNodeCheckInterval: number,
  maxOfflineTime: number,
  maxChunkSize: number
}