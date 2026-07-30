import { createBaseTracingCollector } from "./base.mts";
import type { TracingCollector } from "./base.mts";
import type { Runtime, Span, Tracer, TracingOptions } from "../../../types/index.js";

/**
 * Event collector options extending tracing options
 */
interface EventCollectorOptions extends TracingOptions {
  interval?: number;
  eventName?: string;
  sendStartSpan?: boolean;
  sendFinishedSpan?: boolean;
  broadcast?: boolean;
}

/**
 * Span data with optional error field for queue
 */
interface SpanData extends Partial<Span> {
  error?: Error | Record<string, unknown>;
}

/**
 * Merge options wirh default options.
 * @param {EventCollectorOptions} options
 * @returns {EventCollectorOptions}
 */
const mergeDefaultOptions = (options: EventCollectorOptions): EventCollectorOptions => {
  return Object.assign(
    {
      interval: 5000,
      eventName: "$tracing.trace.spans",
      sendStartSpan: false,
      sendFinishedSpan: true,
      broadcast: false,
    },
    options,
  );
};

/**
 * Create event collector for tracing
 * @param {EventCollectorOptions} options
 * @returns {(runtime: Runtime, tracer?: Tracer) => TracingCollector}
 */
export default (options: EventCollectorOptions) =>
  (runtime: Runtime, tracer?: Tracer): TracingCollector => {
    const mergedOptions = mergeDefaultOptions(options);

    const exporter = createBaseTracingCollector(runtime) as TracingCollector;

    exporter.init(runtime, tracer);

    const queue: SpanData[] = [];

    let timer: ReturnType<typeof setInterval> | null = null;

    const generateTracingData = (): SpanData[] => {
      return Array.from(queue).map((span) => {
        const newSpan: SpanData = Object.assign({}, span);

        if (newSpan.error) {
          newSpan.error =
            exporter.getErrorFields(
              newSpan.error as Error,
              exporter.options.errors?.fields ?? [],
            ) ?? undefined;
        }

        return newSpan;
      });
    };

    const flushQueue = (): void => {
      if (queue.length === 0) {
        return;
      }

      const data = generateTracingData();
      queue.length = 0;

      if (mergedOptions.broadcast) {
        exporter.runtime.eventBus.broadcast(mergedOptions.eventName!, data);
      } else {
        exporter.runtime.eventBus.emit(mergedOptions.eventName!, data);
      }
    };

    if (mergedOptions.interval! > 0) {
      timer = setInterval(() => flushQueue(), mergedOptions.interval);
      timer.unref();
    }

    exporter.init = (_runtime: Runtime): void => {};

    exporter.startedSpan = (span: SpanData): void => {
      if (mergedOptions.sendStartSpan) {
        queue.push(span);
        if (!timer) {
          flushQueue();
        }
      }
    };

    exporter.finishedSpan = (span: SpanData): void => {
      if (mergedOptions.sendFinishedSpan) {
        queue.push(span);
        if (!timer) {
          flushQueue();
        }
      }
    };

    exporter.stop = async (): Promise<void> => {
      if (timer) {
        clearInterval(timer);
        timer = null;
      }
    };

    return exporter;
  };
