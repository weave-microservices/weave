import hrTime from "./time.mts";
import type {
  Logger,
  Runtime,
  Service,
  Span as SpanInterface,
  TracingOptions,
} from "../../types/index.js";

/**
 * Internal tracer interface used by Span
 */
interface InternalTracer {
  runtime: Runtime;
  options: TracingOptions | undefined;
  log: Logger;
  shouldSample(): boolean;
  invokeCollectorMethod(method: string, args: unknown[]): void;
  startSpan(name: string, options?: SpanOptionsInternal): SpanInterface;
  stop(): Promise<void>;
}

/**
 * Service info for span
 */
interface SpanServiceInfo {
  name: string;
  version?: string | number;
  fullyQualifiedName: string;
}

/**
 * Internal span options
 */
interface SpanOptionsInternal {
  id?: string;
  traceId?: string;
  parentId?: string;
  type?: string;
  sampled?: boolean;
  service?: Service | SpanServiceInfo;
  tags?: Record<string, unknown>;
  defaultTags?: Record<string, unknown>;
}

function defineReadonlyProperty<T>(
  instance: object,
  propName: string,
  value: T,
  readOnly: boolean = false,
): void {
  Object.defineProperty(instance, propName, {
    value,
    writable: !!readOnly,
    enumerable: false,
  });
}

/**
 * Span class for distributed tracing
 */
export class Span implements SpanInterface {
  // Public properties from SpanInterface
  public name: string;
  public id: string;
  public traceId: string;
  public parentId?: string;
  public type: string;
  public sampled: boolean;
  public tags: Record<string, unknown>;
  public service?: SpanServiceInfo;
  public startTime?: number;
  public finishTime?: number;
  public duration?: number;
  public error?: Error;

  // Private/internal properties (defined via defineReadonlyProperty)
  private readonly tracer!: InternalTracer;
  private readonly options!: SpanOptionsInternal;
  private readonly meta!: Record<string, unknown>;

  constructor(tracer: InternalTracer, name: string, options: SpanOptionsInternal = {}) {
    defineReadonlyProperty(this, "tracer", tracer, true);
    defineReadonlyProperty(this, "options", options || {});
    defineReadonlyProperty(this, "meta", {});

    this.name = name;
    this.id = options.id || tracer.runtime.generateUUID();
    this.traceId = options.traceId || this.id;
    this.parentId = options.parentId;
    this.type = options.type || "custom";
    this.sampled = options.sampled ?? tracer.shouldSample();
    this.tags = {};

    if (options.service) {
      this.service = {
        name: options.service.name,
        version: options.service.version,
        fullyQualifiedName: options.service.fullyQualifiedName,
      };
    }

    if (options.defaultTags) {
      this.addTags(options.defaultTags);
    }

    if (options.tags) {
      this.addTags(options.tags);
    }
  }

  addTags(tags: Record<string, unknown>): this {
    Object.assign(this.tags, tags);
    return this;
  }

  start(time?: number): this {
    this.startTime = time || hrTime();
    if (this.sampled) {
      this.tracer.invokeCollectorMethod("startedSpan", [this]);
    }
    return this;
  }

  startChildSpan(name: string, options: SpanOptionsInternal = {}): SpanInterface {
    const parentOptions: SpanOptionsInternal = {
      parentId: this.id,
      traceId: this.traceId,
      sampled: this.sampled,
      service: this.service,
    };
    return this.tracer.startSpan(name, Object.assign(parentOptions, options));
  }

  finish(time?: number): this {
    this.finishTime = time || hrTime();
    this.duration = this.finishTime - (this.startTime || 0);

    this.tracer.log.debug(`Span "${this.id}" finished`);

    if (this.sampled) {
      this.tracer.invokeCollectorMethod("finishedSpan", [this]);
    }

    return this;
  }

  isActive(): boolean {
    return this.finishTime !== null;
  }

  setError(error: Error): this {
    this.error = error;
    return this;
  }
}

// export const createSpan = (tracer, name, options) => {
//   const span = Object.assign({}, {
//     name,
//     id: options.id || tracer.runtime.generateUUID(),
//     traceId: options.traceId || span.id,
//     parentId: options.parentId,
//     type: options.type || 'custom',
//     sampled: options.sampled || tracer.shouldSample(),
//     service: options.service,
//     tags: {}
//   });

//   if (options.service) {
//     span.service = {
//       name: options.service.name,
//       version: options.service.version,
//       fullyQualifiedName: options.service.fullyQualifiedName
//     };
//   }

//   span.addTags = (tags) => {
//     Object.assign(span.tags, tags);
//     return span;
//   };

//   span.start = (time) => {
//     span.startTime = time || hrTime();
//     if (span.sampled) {
//       tracer.invokeCollectorMethod('startedSpan', [span]);
//     }
//     return span;
//   };

//   span.startChildSpan = (name, options) => {
//     const parentOptions = {
//       parentId: options.parentId,
//       sampled: options.sampled
//     };
//     return tracer.startSpan(name, Object.assign(parentOptions, options));
//   };

//   span.finish = (time) => {
//     span.finishTime = time || hrTime();
//     span.duration = span.finishTime - span.startTime;

//     tracer.log.debug(`Span "${span.id}" finished`);

//     if (span.sampled) {
//       tracer.invokeCollectorMethod('finishedSpan', [span]);
//     }

//     return span;
//   };

//   span.isActive = () => span.finishTime !== null;

//   span.setError = (error) => {
//     span.error = error;
//     return span;
//   };

//   if (options.tags) {
//     span.addTags(options.tags);
//   }

//   return span;
// };
