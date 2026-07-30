import os from "os";
import { createNode } from "../../helper/index.mts";
import * as Constants from "../../../lib/metrics/constants.mts";
import { describe, it, before, after } from "node:test";
import assert from "node:assert/strict";

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
  const node = createNode(
    Object.assign({ nodeId: "node-metrics", namespace: "metrics" }, defaultSettings),
  );
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
      "metrics",
    );
    assert.strictEqual(
      (metrics.getMetric(Constants.WEAVE_NODE_ID) as MetricWithValue).value,
      "node-metrics",
    );
    assert.strictEqual(
      (metrics.getMetric(Constants.WEAVE_VERSION) as MetricWithValue).value,
      node.version,
    );

    // Process metrics
    assert.strictEqual(
      (metrics.getMetric(Constants.PROCESS_PID) as MetricWithValue).value,
      process.pid,
    );
    assert.strictEqual(
      (metrics.getMetric(Constants.PROCESS_PPID) as MetricWithValue).value,
      process.ppid,
    );
    assert.ok(
      ((metrics.getMetric(Constants.PROCESS_UPTIME) as MetricWithValue).value as number) <
        process.uptime(),
    );

    // OS Metrics
    assert.strictEqual(
      (metrics.getMetric(Constants.OS_HOSTNAME) as MetricWithValue).value,
      os.hostname(),
    );
    assert.strictEqual((metrics.getMetric(Constants.OS_TYPE) as MetricWithValue).value, os.type());
    assert.strictEqual(
      (metrics.getMetric(Constants.OS_RELEASE) as MetricWithValue).value,
      os.release(),
    );
    assert.strictEqual((metrics.getMetric(Constants.OS_ARCH) as MetricWithValue).value, os.arch());
    assert.strictEqual(
      (metrics.getMetric(Constants.OS_PLATTFORM) as MetricWithValue).value,
      os.platform(),
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
