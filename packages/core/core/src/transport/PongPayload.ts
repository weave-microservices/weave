import { Payload } from "./Payload";

export type PongPayload = {
  dispatchTime: number;
  arrivalTime: number
} & Payload