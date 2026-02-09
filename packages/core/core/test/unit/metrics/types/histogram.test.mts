import { createHistogram } from "../../../../lib/metrics/types/histogram.mts";
import { createNode } from "../../../helper/index.mts";
import { describe, it } from "node:test";

describe("Test Histogram", () => {
  it("should generate a histogram", () => {
    const broker = createNode({
      logger: {
        enabled: false,
      },
      metrics: {
        enabled: true,
      },
    });

    const storage = broker.runtime.metrics;

    const histogram = createHistogram(storage!, {
      name: "requests",
      description: "description",
      type: "histogram",
      labels: ["service"],
      buckets: [0.1, 0.5, 1, 2.5, 5, 10],
    });
    histogram.observe(1, { service: "test-service" });
    histogram.observe(2, { service: "test-service1" }, Date.now());
    histogram.observe(1, { service: "test-service" });
    histogram.observe(4, { service: "test-service2" }, Date.now());
    histogram.observe(1, { service: "test-service" }, Date.now());
    histogram.observe(9, { service: "test-service3" }, Date.now());
    histogram.observe(9, { service: "test-service" }, Date.now());
  });
});
