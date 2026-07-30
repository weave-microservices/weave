import { resolveCollector } from "../tracing/collectors/index.mts";
import { Span } from "../tracing/span.mts";
import type {
  Runtime,
  SpanOptions,
  Logger,
  TracingOptions,
  Span as SpanInterface,
} from "../../types/index.js";

/**
 * Collector interface for tracing
 */
interface Collector {
  init(runtime: Runtime): void;
  stop(): Promise<void>;
  startedSpan?(span: SpanInterface): void;
  finishedSpan?(span: SpanInterface): void;
  [method: string]: unknown;
}

/**
 * Internal tracer interface
 */
interface InternalTracer {
  runtime: Runtime;
  options: TracingOptions | undefined;
  log: Logger;
  stop(): Promise<void>;
  shouldSample(): boolean;
  invokeCollectorMethod(method: string, args: unknown[]): void;
  startSpan(name: string, spanOptions?: SpanOptions): SpanInterface;
}

export const initTracer = (runtime: Runtime): void => {
  const options = runtime.options.tracing;
  const log = runtime.createLogger("TRACER");

  let collectors: Collector[] = [];
  let samplingCounter = 0;

  const tracer: InternalTracer = {
    runtime,
    options,
    log,
    async stop(): Promise<void> {
      if (collectors.length > 0) {
        await Promise.all(collectors.map((collector) => collector.stop()));
      }
    },
    shouldSample(): boolean {
      if (options?.samplingRate === 0) {
        return false;
      }

      if (options?.samplingRate === 1) {
        return true;
      }

      if (++samplingCounter * (options?.samplingRate ?? 1) >= 1) {
        samplingCounter = 0;
        return true;
      }

      return false;
    },
    invokeCollectorMethod(method: string, args: unknown[]): void {
      collectors.forEach((collector) => {
        const collectorMethod = collector[method];
        if (typeof collectorMethod === "function") {
          (collectorMethod as (...args: unknown[]) => void).apply(collector, args);
        }
      });
    },
    startSpan(name: string, spanOptions: SpanOptions = {}): SpanInterface {
      const parentOptions: SpanOptions = {};

      if (spanOptions.parentSpan) {
        parentOptions.traceId = spanOptions.parentSpan.traceId;
        parentOptions.parentId = spanOptions.parentSpan.id;
        parentOptions.sampled = spanOptions.parentSpan.sampled;
      }

      const span = new Span(
        this,
        name,
        Object.assign(
          {
            type: "custom",
            defaultTags: options?.defaultTags,
          },
          parentOptions,
          spanOptions,
          {
            parentSpan: undefined,
          },
        ),
      );

      span.start();

      return span;
    },
  };

  Object.defineProperty(runtime, "tracer", {
    value: tracer,
  });

  if (options?.enabled) {
    log.debug("Tracer initialized.");

    if (options.collectors) {
      collectors = options.collectors.map((entry) => {
        const initCollector = resolveCollector(runtime, entry) as Collector;
        initCollector.init(runtime);
        return initCollector;
      });
    }
  }
};
