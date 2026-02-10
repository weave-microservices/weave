import { uuid, isFunction, isStream, isStreamObjectMode } from "@weave-js/utils";
import { WeaveMaxCallLevelError, WeaveError } from "../errors.mts";
import type {
  Runtime,
  Context,
  Span,
  SpanOptions,
  Endpoint,
  ActionOptions,
  EventOptions,
} from "../../types/index.js";
import type { Readable } from "stream";

export const createContext = <T = any,>(runtime: Runtime): Context<T> => {
  const spanStack: Span[] = [];

  const context: Context<T> = {
    id: undefined,
    nodeId: runtime.nodeId,
    parentId: undefined,
    callerNodeId: null as any,
    endpoint: undefined,
    data: {} as T,
    meta: {},
    level: 1,
    tracing: null as any,
    span: undefined,
    service: undefined,
    startHighResolutionTime: null,
    options: {} as any,
    duration: 0,
    stopTime: 0,
    isCachedResult: false,
    setData(newParams: T): void {
      this.data = newParams || ({} as T);
    },
    setStream(stream: Readable): void {
      if (isStream(stream)) {
        if (isStreamObjectMode(context.options.stream)) {
          this.meta.$isObjectModeStream = true;
        }
        this.stream = stream;
      } else {
        throw new WeaveError("No valid stream.");
      }
    },
    setEndpoint(endpoint: Endpoint): void {
      this.nodeId = endpoint.node.id;
      this.endpoint = endpoint;
      this.action = endpoint.action;
      this.service = endpoint.action.service;

      // Use the cached logger from the action
      if (endpoint.action && endpoint.action.log) {
        this.log = endpoint.action.log;
      }
    },
    emit(eventName: string, payload?: unknown, options: EventOptions = {}): Promise<void> {
      (options as Record<string, unknown>).parentContext = this;
      return runtime.eventBus!.emit(eventName, payload, options);
    },
    broadcast(eventName: string, payload?: unknown, options: EventOptions = {}): Promise<void> {
      (options as Record<string, unknown>).parentContext = this;
      return runtime.eventBus!.broadcast(eventName, payload, options);
    },
    call<TParams = any, TResult = any>(
      actionName: string,
      params?: TParams,
      options: ActionOptions = {},
    ): Promise<TResult> {
      (options as any).parentContext = this;
      if (
        runtime.options.registry?.maxCallLevel &&
        runtime.options.registry.maxCallLevel > 0 &&
        this.level >= runtime.options.registry.maxCallLevel
      ) {
        return Promise.reject(
          new WeaveMaxCallLevelError({
            nodeId: runtime.nodeId,
            maxCallLevel: runtime.options.registry.maxCallLevel,
          }),
        );
      }

      const p = runtime.actionInvoker.call(actionName, params, options) as Promise<TResult> & {
        context?: Context;
      };

      return p.then((result: TResult) => {
        if (p.context) {
          this.meta = Object.assign(this.meta, p.context.meta);
        }
        return result;
      });
    },
    startSpan(name?: string, options?: SpanOptions): Span {
      let span: Span;
      if (this.span) {
        span = (
          this.span as Span & {
            startChildSpan: (name?: string, options?: SpanOptions) => Span;
          }
        ).startChildSpan(name, options);
      } else {
        span = runtime.tracer!.startSpan(name || "span", options);
      }
      spanStack.push(span);
      this.span = span;

      return this.span;
    },
    finishSpan(span?: Span, time?: number): void {
      if (!span || !(span as Span & { isActive: () => boolean }).isActive()) {
        return;
      }

      (span as Span & { finish: (time?: number) => void; isActive: () => boolean }).finish(time);

      const idx = spanStack.findIndex((s) => s === span);

      if (idx !== -1) {
        spanStack.splice(idx, 1);
        this.span = spanStack[spanStack.length - 1];
      } else {
        /* istanbul ignore next */
        this.service?.log?.warn("This span is not assigned to this context", span);
      }
    },
    /**
     * Copy the current context.
     * @returns New copied context
     */
    copy(): Context<T> {
      const contextCopy = createContext<T>(runtime);

      contextCopy.nodeId = this.nodeId;
      contextCopy.options = this.options;
      contextCopy.data = this.data;
      contextCopy.meta = this.meta;
      contextCopy.parentId = this.parentId;
      contextCopy.callerNodeId = this.callerNodeId;
      contextCopy.requestId = this.requestId;
      contextCopy.tracing = this.tracing;
      contextCopy.span = this.span;
      contextCopy.level = this.level;
      contextCopy.eventName = this.eventName;
      contextCopy.eventType = this.eventType;
      contextCopy.eventGroups = this.eventGroups;
      contextCopy.isCachedResult = this.isCachedResult;

      return contextCopy;
    },
  };

  // Generate context Id
  if (!context.id) {
    // Use UUID factory from broker options
    if (runtime.options.uuidFactory && isFunction(runtime.options.uuidFactory)) {
      context.id = runtime.options.uuidFactory.call(context, runtime);
    } else {
      context.id = uuid();
    }

    // Pass existing request ID
    if (!context.requestId) {
      context.requestId = context.id;
    }
  }

  return context;
};
