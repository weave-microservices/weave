import { createBaseMetricType, type BaseMetricInstance, type MetricCreateOptions, type MetricSnapshotItem, type MetricValueItem } from "./base.mts";
import type { MetricRegistry } from "../../../types/index.js";

/**
 * Histogram metric instance interface
 * Note: Histogram has a different set signature than other metrics (labels first, value second)
 */
export interface HistogramMetricInstance extends Omit<BaseMetricInstance, "set"> {
  value: number;
  buckets: number[];
  observe(value: number, labels: Record<string, string> | null, timestamp?: number): void;
  decrement(labels: Record<string, string> | null, value: number, timestamp?: number): void;
  set(labels: Record<string, string> | null, value: number, timestamp?: number): MetricValueItem | undefined;
}

export const createHistogram = (registry: MetricRegistry, obj: MetricCreateOptions): HistogramMetricInstance => {
  const base = createBaseMetricType(registry, obj) as unknown as HistogramMetricInstance;

  base.value = 0;

  // create default buckets
  if (obj.buckets) {
    base.buckets = registry.options.defaultBuckets || [];
  }

  base.buckets = (base.buckets || []).sort((a: number, b: number) => a - b);

  base.observe = (value: number, labels: Record<string, string> | null, _timestamp?: number): void => {
    const item = base.values.get(base.stringifyLabels(labels));

    if (!value) {
      return;
    }

    base.set(labels, (item ? item.value : 0) + value);
  };

  base.decrement = (labels: Record<string, string> | null, value: number, _timestamp?: number): void => {
    const item = base.get(labels);

    base.set(labels, (item ? item.value : 0) - value);
  };

  base.generateSnapshot = (): MetricSnapshotItem[] => {
    return Array.from(base.values).map(([_labelString, item]: [string, MetricValueItem]) => {
      return {
        value: item.value,
        labels: item.labels,
      };
    });
  };

  base.set = (labels: Record<string, string> | null, value: number, _timestamp?: number): MetricValueItem | undefined => {
    const labelString = base.stringifyLabels(labels);
    const existingItem = base.values.get(labelString);

    base.value = value;

    if (existingItem) {
      if (existingItem.value !== value) {
        existingItem.labels = labels;
        existingItem.value = value;
      }
      return existingItem;
    } else {
      const newItem: MetricValueItem = {
        labels: labels,
        value: value,
      };

      base.values.set(labelString, newItem);
      return newItem;
    }
  };

  return base;
};
