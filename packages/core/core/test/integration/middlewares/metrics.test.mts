import { WeaveError } from "../../../lib/errors.mts";
import { TransportAdapters } from "../../../lib/index.mts";
import * as Constants from "../../../lib/metrics/constants.mts";
import { createNode } from "../../helper/index.mts";
import { describe, it, beforeEach, afterEach, mock } from "node:test";
import assert from "node:assert/strict";
import type { Broker } from "../../../types/index.js";
import type { BaseMetricInstance } from "../../../lib/metrics/types/base.mts";

describe("Metric middleware", () => {
  let broker: Broker;

  beforeEach(() => {
    broker = createNode({
      nodeId: "node-metrics1",
      logger: {
        enabled: false,
      },
      metrics: {
        enabled: true,
      },
    });

    broker.createService({
      name: "test-service",
      actions: {
        testAction() {
          return new Promise((resolve) => {
            setTimeout(() => {
              resolve("hello");
            }, 2000);
          });
        },
        throwError() {
          throw new Error("not found");
        },
      },
    });

    return broker.start();
  });

  afterEach(() => broker.stop());

  it("should update the request metrics", (_t, done) => {
    const metrics = broker.runtime.metrics;
    const p = broker.call("test-service.testAction");

    assert.strictEqual(
      (metrics?.getMetric(Constants.REQUESTS_IN_FLIGHT) as BaseMetricInstance | undefined)?.value,
      1,
    );

    p.then(() => {
      assert.strictEqual(
        (metrics?.getMetric(Constants.REQUESTS_TOTAL) as BaseMetricInstance | undefined)?.value,
        1,
      );
      assert.ok(
        ((metrics?.getMetric(Constants.REQUESTS_TIME) as BaseMetricInstance | undefined)?.value ??
          0) > 2000,
      );
      done();
    });
  });

  it("should update the request metrics on Error", (_t, done) => {
    const metrics = broker.runtime.metrics;
    const p = broker.call("test-service.throwError");

    assert.strictEqual(
      (metrics?.getMetric(Constants.REQUESTS_IN_FLIGHT) as BaseMetricInstance | undefined)?.value,
      1,
    );

    p.catch((_: unknown) => {
      assert.strictEqual(
        (metrics?.getMetric(Constants.REQUESTS_TOTAL) as BaseMetricInstance | undefined)?.value,
        1,
      );
      assert.ok(
        ((metrics?.getMetric(Constants.REQUESTS_TIME) as BaseMetricInstance | undefined)?.value ??
          0) > 0,
      );
      assert.strictEqual(
        (metrics?.getMetric(Constants.REQUESTS_ERRORS_TOTAL) as BaseMetricInstance | undefined)
          ?.value,
        1,
      );
      done();
    });
  });

  // it('should throw an timeout after timeout', (done) => {
  //   return broker.call('test-service.testAction', null, { timeout: 3000 })
  //     .then(result => {
  //       assert.strictEqual(result, 'hello')
  //     })
  // })
});

describe("Metric middleware [cache]", () => {
  let broker: Broker;

  beforeEach(() => {
    broker = createNode({
      nodeId: "node-metrics2",
      logger: {
        enabled: false,
      },
      metrics: {
        enabled: true,
      },
      cache: {
        enabled: true,
      },
    });

    broker.createService({
      name: "test-service",
      actions: {
        testAction: {
          params: {
            name: "string",
          },
          cache: {
            keys: ["name"],
          },
          handler(context) {
            return (context.data as { name: string }).name;
          },
        },
      },
    });

    return broker.start();
  });

  afterEach(() => broker.stop());

  it("should register metrics", async () => {
    const metrics = broker.runtime.metrics;

    assert.strictEqual(
      (metrics?.getMetric(Constants.CACHE_GET_TOTAL) as BaseMetricInstance | undefined)?.value,
      0,
    );
    assert.strictEqual(
      (metrics?.getMetric(Constants.CACHE_SET_TOTAL) as BaseMetricInstance | undefined)?.value,
      0,
    );
    assert.strictEqual(
      (metrics?.getMetric(Constants.CACHE_FOUND_TOTAL) as BaseMetricInstance | undefined)?.value,
      0,
    );
    assert.strictEqual(
      (metrics?.getMetric(Constants.CACHE_EXPIRED_TOTAL) as BaseMetricInstance | undefined)?.value,
      0,
    );
    assert.strictEqual(
      (metrics?.getMetric(Constants.CACHE_DELETED_TOTAL) as BaseMetricInstance | undefined)?.value,
      0,
    );
    assert.strictEqual(
      (metrics?.getMetric(Constants.CACHE_CLEANED_TOTAL) as BaseMetricInstance | undefined)?.value,
      0,
    );

    await broker.call("test-service.testAction", { name: "Kevin" });
    await broker.call("test-service.testAction", { name: "Kevin" });

    assert.strictEqual(
      (metrics?.getMetric(Constants.CACHE_GET_TOTAL) as BaseMetricInstance | undefined)?.value,
      2,
    );
    assert.strictEqual(
      (metrics?.getMetric(Constants.CACHE_FOUND_TOTAL) as BaseMetricInstance | undefined)?.value,
      1,
    );
  });
});

describe("Metric middleware between remote nodes", () => {
  let broker1: Broker;
  let broker2: Broker;

  beforeEach(() => {
    broker1 = createNode({
      nodeId: "node-metrics3",
      logger: {
        enabled: false,
      },
      metrics: {
        enabled: true,
      },
      transport: {
        adapter: TransportAdapters.Dummy(),
      },
    });

    broker2 = createNode({
      nodeId: "node-metrics4",
      logger: {
        enabled: false,
      },
      metrics: {
        enabled: true,
      },
      transport: {
        adapter: TransportAdapters.Dummy(),
      },
    });

    broker2.createService({
      name: "test-service",
      actions: {
        testAction: {
          params: {
            name: "string",
          },
          handler(context) {
            return (context.data as { name: string }).name;
          },
        },
      },
    });

    return Promise.all([broker1.start(), broker2.start()]);
  });

  afterEach(() => Promise.all([broker1.stop(), broker2.stop()]));

  it("should register metrics", async () => {
    const metrics1 = broker1.runtime.metrics;
    const metrics2 = broker2.runtime.metrics;

    await broker1.call("test-service.testAction", { name: "Kevin" });
    await broker1.call("test-service.testAction", { name: "Kevin" });
    await broker1.call("test-service.testAction", { name: "Kevin" });

    assert.strictEqual(
      (metrics1?.getMetric(Constants.REQUESTS_TOTAL) as BaseMetricInstance | undefined)?.value,
      3,
    );
    assert.strictEqual(
      (metrics1?.getMetric(Constants.REQUESTS_IN_FLIGHT) as BaseMetricInstance | undefined)?.value,
      0,
    );

    assert.strictEqual(
      (metrics2?.getMetric(Constants.REQUESTS_TOTAL) as BaseMetricInstance | undefined)?.value,
      3,
    );
    assert.strictEqual(
      (metrics2?.getMetric(Constants.REQUESTS_IN_FLIGHT) as BaseMetricInstance | undefined)?.value,
      0,
    );
  });
});

describe("Metric adapters validation", () => {
  it("should register metrics", async () => {
    try {
      const broker1 = createNode({
        nodeId: "node-metrics5",
        logger: {
          enabled: false,
        },
        metrics: {
          enabled: true,
          adapters: {} as unknown as Array<string | object>, // <- need to be an array of objects
        },
        transport: {
          adapter: TransportAdapters.Dummy(),
        },
      });
      await broker1.start();
    } catch (error) {
      assert.ok(error instanceof WeaveError);
      assert.strictEqual(error.message, "Metic adapter needs to be an Array.");
    }
  });

  it("should init metric adapter.", async () => {
    const mockMetricInitFunction = mock.fn();
    const mockMetricAdapter = () => {
      return {
        init: mockMetricInitFunction,
      };
    };

    const broker1 = createNode({
      nodeId: "node-metrics6",
      logger: {
        enabled: false,
      },
      metrics: {
        enabled: true,
        adapters: [mockMetricAdapter()],
      },
      transport: {
        adapter: TransportAdapters.Dummy(),
      },
    });
    await broker1.start();

    assert.strictEqual(mockMetricInitFunction.mock.calls.length, 1);
  });
});
