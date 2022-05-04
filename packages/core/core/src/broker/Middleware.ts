import { ActionContext } from "./ActionContext";
import { Context } from "./Context";

export type CallCallback<T> = (context: Context<T>) => {}
export type ActionMiddlewareWrapper = (next: () => {}) => CallCallback<ActionContext>; 
export interface Middleware {
  call: ActionMiddlewareWrapper;
  multiCall: (next: Function) => {};
  localAction: (next: Function) => {};
  remoteAction: (next: Function) => {};
}