import { isPlainObject, isFunction } from "@weave-js/utils";
import { WeaveError } from "../errors.mts";
import { registerCommonMetrics, updateCommonMetrics } from "../metrics/common.mts";
import MetricTypes from "../metrics/types/index.mts";
import type { BaseMetricInstance, MetricCreateOptions } from "../metrics/types/base.mts";
import type { Runtime, MetricsOptions } from "../../types/index.js";

/**
 * Metrics adapter interface
 */
interface MetricsAdapter {
  init(registry: MetricRegistryInternal): void;
  stop(): Promise<void>;
}

/**
 * Internal metrics registry interface
 */
interface MetricRegistryInternal {
  runtime: Runtime;
  options: MetricsOptions;
  storage: Map<string, BaseMetricInstance>;
  log: import("../../types/index.js").Logger;
  adapters?: MetricsAdapter[];
  init(): void;
  stop(): Promise<PromiseSettledResult<void>[] | void>;
  register(obj: MetricCreateOptions): BaseMetricInstance | undefined;
  increment(
    name: string,
    labels: Record<string, string> | null,
    value?: number,
    timestamp?: number,
  ): null | void;
  decrement(
    name: string,
    labels: Record<string, string> | null,
    value?: number,
    timestamp?: number,
  ): null | void;
  set(
    name: string,
    value: number,
    labels: Record<string, string> | null,
    timestamp?: number,
  ): null | void;
  timer(name: string, labels: Record<string, string> | null, timestamp?: number): () => number;
  getMetric(name: string): BaseMetricInstance | undefined;
  list(): ReturnType<BaseMetricInstance["toObject"]>[];
}

export const initMetrics = (runtime: Runtime): void => {
  const metricOptions = runtime.options.metrics;

  if (metricOptions?.enabled) {
    const storage = new Map<string, BaseMetricInstance>();

    const log = runtime.createLogger("METRICS");

    let commonUpdateTimer: NodeJS.Timeout;

    Object.defineProperty(runtime, "metrics", {
      value: {
        runtime,
        options: metricOptions,
        storage,
        log,
        init(): void {
          if (metricOptions.adapters) {
            if (!Array.isArray(metricOptions.adapters)) {
              runtime.handleError(new WeaveError("Metic adapter needs to be an Array."));
            }

            this.adapters = metricOptions.adapters.map((adapter: string | object) => {
              (adapter as MetricsAdapter).init(this);
              return adapter as MetricsAdapter;
            });
          }
        },
        async stop(): Promise<PromiseSettledResult<void>[] | void> {
          if (commonUpdateTimer) {
            clearInterval(commonUpdateTimer);
          }

          if (!this.adapters || this.adapters.length === 0) {
            return;
          }

          const results = await Promise.allSettled(
            this.adapters.map((adapter: MetricsAdapter) => adapter.stop()),
          );
          const failures = results.filter(
            (result): result is PromiseRejectedResult => result.status === "rejected",
          );

          if (failures.length > 0) {
            failures.forEach((failure: PromiseRejectedResult) => {
              log.warn(failure.reason, "Failed to stop metrics adapter");
            });
            log.warn(
              `Failed to stop ${failures.length} of ${this.adapters.length} metrics adapters`,
            );
          }

          return results;
        },
        register(obj: MetricCreateOptions): BaseMetricInstance | undefined {
          if (!isPlainObject(obj)) {
            runtime.handleError(new WeaveError("Param needs to be an object."));
          }

          if (!obj.type) {
            runtime.handleError(new WeaveError("Type is missing."));
          }

          if (!obj.name) {
            runtime.handleError(new WeaveError("Name is missing."));
          }

          const createMetricType = MetricTypes.resolve(obj.type);

          if (!createMetricType) {
            runtime.handleError(new WeaveError("Unknown metric type."));
            return undefined;
          }

          // Cast this to any to work around the MetricRegistry interface mismatch
          // The internal registry has additional methods that the public interface doesn't expose
          // eslint-disable-next-line @typescript-eslint/no-explicit-any
          const type = createMetricType(this as any, obj);

          this.storage.set(obj.name, type);

          return type;
        },
        increment(
          name: string,
          labels: Record<string, string> | null,
          value: number = 1,
          timestamp?: number,
        ): null | void {
          if (!metricOptions.enabled) {
            return null;
          }

          const item = this.storage.get(name);

          if (!item) {
            runtime.handleError(new WeaveError("Item not found."));
            return;
          }

          item.increment?.(labels, value, timestamp);
        },
        decrement(
          name: string,
          labels: Record<string, string> | null,
          value: number = 1,
          timestamp?: number,
        ): null | void {
          if (!metricOptions.enabled) {
            return null;
          }

          const item = this.storage.get(name);

          if (!item) {
            runtime.handleError(new WeaveError("Item not found."));
            return;
          }

          item.decrement?.(labels, value, timestamp);
        },
        set(
          name: string,
          value: number,
          labels: Record<string, string> | null,
          timestamp?: number,
        ): null | void {
          if (!metricOptions.enabled) {
            return null;
          }

          const item = this.storage.get(name);

          if (!item || !isFunction(item.set)) {
            runtime.handleError(new WeaveError("Invalid metric type"));
            return;
          }

          item.set(value, labels, timestamp);
        },
        timer(
          name: string,
          labels: Record<string, string> | null,
          timestamp?: number,
        ): () => number {
          let item: BaseMetricInstance | undefined;
          if (name) {
            item = this.storage.get(name);
          }
          const start = process.hrtime();

          return (): number => {
            const delta = process.hrtime(start);
            const duration = (delta[0] + delta[1] / 1e9) * 1000;
            if (item && item.set) {
              item.set(duration, labels, timestamp);
            }
            return duration;
          };
        },
        getMetric(name: string): BaseMetricInstance | undefined {
          const item = this.storage.get(name);

          if (!item) {
            runtime.handleError(new WeaveError("Item not found."));
          }

          return item;
        },
        list(): ReturnType<BaseMetricInstance["toObject"]>[] {
          const results: ReturnType<BaseMetricInstance["toObject"]>[] = [];

          this.storage.forEach((metric: BaseMetricInstance) => {
            results.push(metric.toObject());
          });

          return results;
        },
      } as MetricRegistryInternal,
    });

    if (metricOptions.enabled && metricOptions.collectCommonMetrics) {
      registerCommonMetrics(runtime);
      commonUpdateTimer = setInterval(
        () => updateCommonMetrics(runtime),
        metricOptions.collectInterval,
      );
      commonUpdateTimer.unref();
    }
  }
};
