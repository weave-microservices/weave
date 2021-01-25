import { TransportAdapter } from "./transport-adapter.interface";

export interface TCPTransportAdapter extends TransportAdapter {
  sendHello?: (nodeId: string) => Promise<any>
}