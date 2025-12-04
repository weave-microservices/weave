import { isFunction } from "@weave-js/utils";

type HandlerWrapper<TArgs extends unknown[] = [unknown], TResult = unknown> = {
  handler: (...args: TArgs) => TResult;
  [key: string]: unknown;
};

type HandlerInput<TArgs extends unknown[] = [unknown], TResult = unknown> =
  | ((...args: TArgs) => TResult)
  | HandlerWrapper<TArgs, TResult>;

export const wrapHandler = <TArgs extends unknown[] = [unknown], TResult = unknown>(
  action: HandlerInput<TArgs, TResult>,
): HandlerWrapper<TArgs, TResult> => (isFunction(action) ? { handler: action } : action);
