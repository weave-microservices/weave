import { Context } from "../interfaces/context.interface";

export type ActionOptions = {
  nodeId?: string,
  context?: Context,
  retries?: number,
  timeout?: number
}