import type { MetricType, MetricRegistry } from "../../../types/index.js";

/**
 * Metric value item stored in the values map
 */
export interface MetricValueItem {
  value: number;
  labels: Record<string, string> | null;
  timestamp?: number;
}

/**
 * Metric snapshot item
 */
export interface MetricSnapshotItem {
  value: number;
  labels: Record<string, string> | null;
}

/**
 * Options for creating a metric
 */
export interface MetricCreateOptions {
  name: string;
  description?: string;
  type: MetricType;
  unit?: string;
  labels?: string[];
  buckets?: number[];
}

/**
 * Base metric type interface
 */
export interface BaseMetricInstance {
  name: string;
  description?: string;
  values: Map<string, MetricValueItem>;
  labels: string[];
  type: MetricType;
  unit?: string;
  value?: number;
  buckets?: number[];
  stringifyLabels(labels: Record<string, string> | null): string;
  get(labels: Record<string, string> | null): MetricValueItem | undefined;
  snapshot(): MetricSnapshotItem[];
  toObject(): {
    type: MetricType;
    name: string;
    description?: string;
    value: MetricSnapshotItem[];
    unit?: string;
  };
  generateSnapshot(): MetricSnapshotItem[];
  set?(
    value: number,
    labels: Record<string, string> | null,
    timestamp?: number,
  ): MetricValueItem | undefined;
  increment?(labels: Record<string, string> | null, value?: number, timestamp?: number): void;
  decrement?(labels: Record<string, string> | null, value?: number, timestamp?: number): void;
  observe?(value: number, labels: Record<string, string> | null, timestamp?: number): void;
}

export const createBaseMetricType = (
  metricRegistry: MetricRegistry,
  obj: MetricCreateOptions,
): BaseMetricInstance => {
  const base: BaseMetricInstance = {
    name: obj.name,
    description: obj.description,
    values: new Map<string, MetricValueItem>(),
    labels: obj.labels || [],
    type: obj.type,
    unit: obj.unit,

    stringifyLabels(labels: Record<string, string> | null): string {
      if (this.labels.length === 0 || labels === null || typeof labels !== "object") {
        return "";
      }

      const parts: (string | number)[] = [];

      this.labels.forEach((labelName: string) => {
        const value = labels[labelName];
        if (typeof value === "number") {
          parts.push(value);
        } else if (typeof value === "string") {
          parts.push(value);
        } else if (typeof value === "boolean") {
          parts.push("" + value);
        } else {
          parts.push("");
        }
      });

      return parts.join("|");
    },

    get(labels: Record<string, string> | null): MetricValueItem | undefined {
      const labelString = this.stringifyLabels(labels);
      return this.values.get(labelString);
    },

    snapshot(): MetricSnapshotItem[] {
      return this.generateSnapshot();
    },

    toObject() {
      return {
        type: this.type,
        name: this.name,
        description: this.description,
        value: this.snapshot(),
        unit: this.unit,
      };
    },

    generateSnapshot(): MetricSnapshotItem[] {
      return [];
    },
  };

  return base;
};
