import { Socket } from 'net'

export class CustomSocket extends Socket {
  public nodeId: string;
  public lastUsage: number;
} 