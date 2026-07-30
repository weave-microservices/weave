import { createGauge, type GaugeMetricInstance } from "./gauge.mts";
import type { MetricCreateOptions } from "./base.mts";
import type { MetricRegistry } from "../../../types/index.js";

/**
 * Counter metric instance interface (gauge without decrement)
 */
export interface CounterMetricInstance extends Omit<GaugeMetricInstance, "decrement"> {
  decrement(): never;
}

export const createCounter = (
  metricRegistry: MetricRegistry,
  obj: MetricCreateOptions,
): CounterMetricInstance => {
  const base = createGauge(metricRegistry, obj) as unknown as CounterMetricInstance;

  base.decrement = (): never => {
    throw new Error("Not allowed to decrement a counter");
  };

  return base;
};
