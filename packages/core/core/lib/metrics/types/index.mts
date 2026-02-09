import type { MetricRegistry } from "../../../types/index.js";
import type { MetricCreateOptions } from "./base.mts";

// Using any here because different metric types have different return types
// (histogram has a different set signature than other metrics)
// eslint-disable-next-line @typescript-eslint/no-explicit-any
type MetricFactory = (registry: MetricRegistry, obj: MetricCreateOptions) => any;

const types: Record<string, MetricFactory> = {
  Counter: (await import("./counter.mts")).createCounter,
  Gauge: (await import("./gauge.mts")).createGauge,
  Info: (await import("./info.mts")).createInfo,
  Histogram: (await import("./histogram.mts")).createHistogram,
};

const getByName = (name: string): MetricFactory | undefined => {
  const n = Object.keys(types).find((i: string) => i.toLocaleLowerCase() === name.toLocaleLowerCase());

  if (n) {
    return types[n];
  }
  return undefined;
};

export default {
  resolve(type: string): MetricFactory | undefined {
    return getByName(type);
  },
};
