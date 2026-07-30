import {
  createBaseMetricType,
  type BaseMetricInstance,
  type MetricCreateOptions,
  type MetricSnapshotItem,
  type MetricValueItem,
} from "./base.mts";
import type { MetricRegistry } from "../../../types/index.js";

/**
 * Gauge metric instance interface
 */
export interface GaugeMetricInstance extends BaseMetricInstance {
  value: number;
  increment(labels: Record<string, string> | null, value: number, timestamp?: number): void;
  decrement(labels: Record<string, string> | null, value: number, timestamp?: number): void;
  set(
    value: number,
    labels: Record<string, string> | null,
    timestamp?: number,
  ): MetricValueItem | undefined;
}

export const createGauge = (
  registry: MetricRegistry,
  obj: MetricCreateOptions,
): GaugeMetricInstance => {
  const base = createBaseMetricType(registry, obj) as GaugeMetricInstance;

  base.value = 0;

  base.increment = (
    labels: Record<string, string> | null,
    value: number,
    timestamp?: number,
  ): void => {
    const item = base.get(labels);
    base.set((item ? item.value : 0) + value, labels, timestamp);
  };

  base.decrement = (
    labels: Record<string, string> | null,
    value: number,
    timestamp?: number,
  ): void => {
    const item = base.get(labels);
    base.set((item ? item.value : 0) - value, labels, timestamp);
  };

  base.generateSnapshot = (): MetricSnapshotItem[] => {
    return Array.from(base.values).map(([_labelString, item]: [string, MetricValueItem]) => {
      return {
        value: item.value,
        labels: item.labels,
      };
    });
  };

  base.set = (
    value: number,
    labels: Record<string, string> | null,
    timestamp: number = Date.now(),
  ): MetricValueItem | undefined => {
    const labelString = base.stringifyLabels(labels);
    let item = base.values.get(labelString);

    base.value = value;

    if (item) {
      if (item.value !== value) {
        item.labels = labels;
        item.value = value;
        item.timestamp = timestamp;
      }
    } else {
      item = {
        labels,
        value,
        timestamp,
      };

      base.values.set(labelString, item);
    }
    return item;
  };

  return base;
};
