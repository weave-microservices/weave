import BaseAdapter, { type MetricExporterAdapter, type MetricExporterOptions } from "./base.mts";
import type { BaseMetric, MetricRegistry, Broker } from "../../../types/index.js";

export default (options?: MetricExporterOptions): MetricExporterAdapter => {
  const lastChanges = new Set<BaseMetric>();

  const adapter = BaseAdapter(options);

  const sendEvent = (): void => {
    const broker = adapter.registry.broker;
    const list = adapter.registry.list();

    // Using type assertion since we're emitting internal metrics events
    (broker.emit as (eventName: string, payload?: unknown) => Promise<void>)(
      adapter.options.eventName as string,
      list,
    );

    lastChanges.clear();
  };

  adapter.init = (registry: MetricRegistry & { broker: Broker }): void => {
    adapter.options = Object.assign(
      {
        eventName: "$metrics.changed",
        interval: 5000,
      },
      options,
    );

    adapter.registry = registry;

    if (adapter.options.interval && adapter.options.interval > 0) {
      adapter.timer = setInterval(() => sendEvent(), adapter.options.interval);
      adapter.timer.unref();
    } else {
      adapter.timer = undefined;
    }
  };

  adapter.stop = (): Promise<void> => {
    clearInterval(adapter.timer);
    return Promise.resolve();
  };

  adapter.metricChanged = (metric: BaseMetric): void => {
    lastChanges.add(metric);
  };

  return adapter;
};
