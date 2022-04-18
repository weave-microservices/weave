import { Runtime } from "..";
import { WeaveError, WeaveMaxCallLevelError } from "../errors";
import { ContextMetadata } from "./ContextMetadata";
import { ContextOptions } from "./ContextOptions";
const { uuid, isFunction, isStream, isStreamObjectMode } = require('@weave-js/utils');

type Endpoint = any; // todo!!!
export type SpanOptions = any; // todo!!!
export type Span = any; // todo!!!

export interface Context<T> {
  setData: (data: unknown) => void;
  copy: () => T;
  setEndpoint: (endpoint: Endpoint) => void;
  setStream: (stream: ReadableStream|WritableStream) => void;
  emit: (eventName: string, payload: unknown, options?: ContextOptions<T>) => Promise<unknown>;
  broadcast: (eventName: string, payload: unknown, options?: ContextOptions<T>) => Promise<unknown>;
  call: (actionName: string, data: unknown, options?: ContextOptions<T>) => Promise<unknown>;
  startSpan: (name: string, options?: SpanOptions) => Span;
  finishSpan: (span: Span) => void;
}

type ActionPromise<ContextType> = Promise<unknown>  &{
  context: ContextType;
} 

export class BaseContext<T> implements Context<T> {
  #runtime: Runtime;
  id: string;
  parentId?: string;
  requestId?: string;
  nodeId: string;
  callerNodeId?: string;
  parentContext?: Context<T>;
  endpoint: Endpoint;
  level: number;
  data: unknown;
  stream?: ReadableStream|WritableStream;
  meta: ContextMetadata;
  options: ContextOptions<T>;
  metrics: boolean;
  
  /**
   * Create a new context object
  */
   constructor(runtime: Runtime) {
    this.#runtime = runtime;
    this.nodeId = runtime.nodeId;
    this.level = 1;
    this.data = {};
    this.meta = {};
    this.options = {};
    this.metrics = false;

    if (this.#runtime.options.uuidFactory && isFunction(this.#runtime.options.uuidFactory)) {
      this.id = this.#runtime.options.uuidFactory.call(this, this.#runtime);
    } else {
      this.id = uuid() as string;
    }

    if (!this.requestId) {
      this.requestId = this.id;
    }
  }


  setData (newData: unknown) {
    this.data = newData || {};
  }

  setStream (stream: ReadableStream|WritableStream): void {
    if (!isStream(stream)) {
      throw new WeaveError('No valid stream.');
    } else {
      if (isStreamObjectMode(this.options.stream)) {
        this.meta.$isObjectModeStream = true;
      }
      this.stream = stream;
    }
  }

  emit (eventName: string, payload: unknown, options: ContextOptions<T> = {}): Promise<unknown> {
    options.parentContext = this as unknown as T;
    return this.#runtime.eventBus.emit(eventName, payload, options);
  }

  broadcast (eventName: string, payload: unknown, options: ContextOptions<T> = {}): Promise<unknown> {
    options.parentContext = this as unknown as T;;
    return this.#runtime.eventBus.broadcast(eventName, payload, options);
  }

  call (actionName:string, data: unknown, options: ContextOptions<ActionContext> = {}) {
    const {maxCallLevel} =this.#runtime.options.registry
    // Shoul we make a copy of the context?
    options.parentContext = this;

    if (maxCallLevel > 0 && this.level >= maxCallLevel) {
      return Promise.reject(
        new WeaveMaxCallLevelError({ nodeId: this.#runtime.nodeId, maxCallLevel: maxCallLevel })
      );
    }

    const promise: ActionPromise = this.#runtime.actionInvoker.call(actionName, data, options);

    return promise.then((result) => {
      if (promise.context) {
        this.meta = Object.assign(this.meta, promise.context.meta);
      }
      return result;
    });
  }

  copy () {}
}
