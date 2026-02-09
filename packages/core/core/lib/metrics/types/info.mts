import { createBaseMetricType, type BaseMetricInstance, type MetricCreateOptions, type MetricSnapshotItem, type MetricValueItem } from "./base.mts";
import type { MetricRegistry } from "../../../types/index.js";

/**
 * Info metric instance interface
 */
export interface InfoMetricInstance extends BaseMetricInstance {
  value?: number;
  set(value: number, labels: Record<string, string> | null, timestamp?: number): MetricValueItem | undefined;
}

export const createInfo = (metricRegistry: MetricRegistry, obj: MetricCreateOptions): InfoMetricInstance => {
  const base = createBaseMetricType(metricRegistry, obj) as InfoMetricInstance;

  base.generateSnapshot = (): MetricSnapshotItem[] => {
    return Array.from(base.values).map(([_labelString, item]: [string, MetricValueItem]) => {
      return {
        value: item.value,
        labels: item.labels,
      };
    });
  };

  base.set = (value: number, labels: Record<string, string> | null, timestamp?: number): MetricValueItem | undefined => {
    const labelString = base.stringifyLabels(labels);
    const existingItem = base.values.get(labelString);

    base.value = value;

    if (existingItem) {
      if (existingItem.value !== value) {
        existingItem.labels = labels;
        existingItem.value = value;
        existingItem.timestamp = timestamp || Date.now();
      }
      return existingItem;
    } else {
      const newItem: MetricValueItem = {
        labels: labels,
        value: value,
        timestamp: timestamp || Date.now(),
      };

      base.values.set(labelString, newItem);
      return newItem;
    }
  };

  return base;
};
