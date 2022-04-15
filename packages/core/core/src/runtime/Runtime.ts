type ActionInvokerTodo = any;
type Options = any;
type Logger = any;

export interface Runtime {
  version: string,
  options: Options,
  actionInvoker: ActionInvokerTodo,
  log: Logger
}