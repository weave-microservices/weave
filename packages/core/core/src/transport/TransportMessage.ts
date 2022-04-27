import { Payload } from "./Payload"

export type TransportMessage = {
  type: string,
  targetNodeId?: string,
  payload: Payload
}
