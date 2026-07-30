import { createNode } from "../../helper/index.mts";
import assert from "node:assert/strict";
import { describe, it, before, after } from "node:test";
import * as Constants from "../../../lib/metrics/constants.mts";

interface MetricWithValue {
  value?: unknown;
  description?: string;
}

const defaultSettings = {
  logger: {
    enabled: false,
  },
  metrics: {
    enabled: true,
  },
};

describe("Test broker metrics", () => {
  const node = createNode(Object.assign({ nodeId: "node", namespace: "test" }, defaultSettings));
  before(() => Promise.all([node.start()]));

  after(() => Promise.all([node.stop()]));

  it("should return broker metrics", () => {
    const metrics = node.runtime.metrics!;
    assert.strictEqual(
      (metrics.getMetric(Constants.WEAVE_ENVIRONMENT) as MetricWithValue).value,
      "Node.js",
    );
    assert.strictEqual(
      (metrics.getMetric(Constants.WEAVE_ENVIRONMENT_VERSION) as MetricWithValue).value,
      process.version,
    );
    assert.strictEqual(
      (metrics.getMetric(Constants.WEAVE_NAMESPACE) as MetricWithValue).value,
      "test",
    );
    assert.strictEqual(
      (metrics.getMetric(Constants.WEAVE_NODE_ID) as MetricWithValue).value,
      "node",
    );
    assert.strictEqual(
      (metrics.getMetric(Constants.WEAVE_VERSION) as MetricWithValue).value,
      node.version,
    );
  });
});

describe("Test metric middleware", () => {
  const node1 = createNode(Object.assign({ nodeId: "node1" }, defaultSettings));

  before(() => Promise.all([node1.start()]));

  after(() => Promise.all([node1.stop()]));

  it("should create a middleware", () => {
    const metric = node1.runtime.metrics!.getMetric("weave.requests.total") as MetricWithValue;
    assert.strictEqual(metric.description, "Number of total requests.");
    assert.strictEqual(metric.value, 0);
  });
});
