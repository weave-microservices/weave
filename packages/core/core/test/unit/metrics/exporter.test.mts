import exporterResolverModule from "../../../lib/metrics/exporter/index.mts";
import { WeaveBrokerOptionsError } from "../../../lib/errors.mts";
import { describe, it, beforeEach, afterEach, mock } from "node:test";
import assert from "node:assert/strict";
import type {
  MetricExporterAdapter,
  MetricExporterOptions,
} from "../../../lib/metrics/exporter/base.mts";

interface MockBroker {
  emit: ReturnType<typeof mock.fn>;
}

interface MockRegistry {
  broker: MockBroker;
  list: ReturnType<typeof mock.fn>;
}

type AdapterFactory = (options?: MetricExporterOptions) => MetricExporterAdapter;

interface AdapterModule {
  default: AdapterFactory;
}

interface ExporterResolver {
  Base: AdapterModule;
  Event: AdapterModule;
  resolve: (
    options: boolean | string | AdapterModule | (() => AdapterModule),
  ) => AdapterModule | (() => AdapterModule) | undefined;
}

const exporterResolver = exporterResolverModule as unknown as ExporterResolver;

// Extended adapter interface for testing that allows partial/mock implementations
interface TestAdapter {
  init: (registry: MockRegistry | MetricExporterAdapter["registry"]) => void;
  stop: () => Promise<unknown>;
  metricChanged?: (metric: unknown) => void;
  options?: Record<string, unknown>;
  registry?: MockRegistry;
  timer?: ReturnType<typeof setInterval>;
}

describe("Metrics Exporter", () => {
  describe("resolve", () => {
    it("should return Event adapter when options is true", () => {
      const result = exporterResolver.resolve(true);
      assert.strictEqual(result, exporterResolver.Event);
    });

    it('should return Event adapter when options is "event"', () => {
      const result = exporterResolver.resolve("event");
      assert.strictEqual(result, exporterResolver.Event);
    });

    it('should return Event adapter when options is "Event"', () => {
      const result = exporterResolver.resolve("Event");
      assert.strictEqual(result, exporterResolver.Event);
    });

    it('should return Base adapter when options is "base"', () => {
      const result = exporterResolver.resolve("base");
      assert.strictEqual(result, exporterResolver.Base);
    });

    it('should return Base adapter when options is "Base"', () => {
      const result = exporterResolver.resolve("Base");
      assert.strictEqual(result, exporterResolver.Base);
    });

    it("should return custom function when options is a function", () => {
      const customAdapter = (() => ({})) as unknown as () => AdapterModule;
      const result = exporterResolver.resolve(customAdapter);
      assert.strictEqual(result, customAdapter);
    });

    it("should throw error for unknown adapter name", () => {
      assert.throws(
        () => {
          exporterResolver.resolve("unknown");
        },
        (error: Error) => error instanceof WeaveBrokerOptionsError,
      );
    });

    it("should throw error with correct message for unknown adapter", () => {
      assert.throws(() => {
        exporterResolver.resolve("invalid");
      }, /Unknown metric adapter: "invalid"/);
    });

    it("should return undefined for falsy options", () => {
      assert.strictEqual(exporterResolver.resolve(false), undefined);
      assert.strictEqual(exporterResolver.resolve(null as unknown as boolean), undefined);
      assert.strictEqual(exporterResolver.resolve(undefined as unknown as boolean), undefined);
      assert.strictEqual(exporterResolver.resolve(0 as unknown as boolean), undefined);
    });

    it("should throw error for empty string", () => {
      assert.throws(
        () => {
          exporterResolver.resolve("");
        },
        (error: Error) => error instanceof WeaveBrokerOptionsError,
      );
    });

    it("should return undefined for unsupported option types", () => {
      assert.strictEqual(exporterResolver.resolve({} as unknown as boolean), undefined);
      assert.strictEqual(exporterResolver.resolve([] as unknown as boolean), undefined);
      assert.strictEqual(exporterResolver.resolve(123 as unknown as boolean), undefined);
    });
  });

  describe("Base adapter", () => {
    let adapter: TestAdapter;

    beforeEach(() => {
      adapter = exporterResolver.Base.default({}) as unknown as TestAdapter;
    });

    it("should create adapter with init method", () => {
      assert.notStrictEqual(adapter.init, undefined);
      assert.strictEqual(typeof adapter.init, "function");
    });

    it("should create adapter with stop method", () => {
      assert.notStrictEqual(adapter.stop, undefined);
      assert.strictEqual(typeof adapter.stop, "function");
    });

    it("should have init method that throws error when called", () => {
      assert.throws(() => {
        adapter.init({} as MockRegistry);
      }, /Init method not implemented/);
    });

    it("should have stop method that returns resolved promise", async () => {
      const result = await adapter.stop();
      assert.strictEqual(result, undefined);
    });
  });

  describe("Event adapter", () => {
    let adapter: TestAdapter;
    let mockRegistry: MockRegistry;
    let mockBroker: MockBroker;

    beforeEach(() => {
      mockBroker = {
        emit: mock.fn(),
      };

      mockRegistry = {
        broker: mockBroker,
        list: mock.fn(() => []),
      };

      adapter = exporterResolver.Event.default({ interval: 1000 }) as unknown as TestAdapter;
    });

    afterEach(() => {
      if (adapter && adapter.stop) {
        adapter.stop();
      }
    });

    it("should create adapter with required methods", () => {
      assert.notStrictEqual(adapter.init, undefined);
      assert.notStrictEqual(adapter.stop, undefined);
      assert.notStrictEqual(adapter.metricChanged, undefined);
    });

    it("should initialize with default options", () => {
      adapter.init(mockRegistry);

      assert.deepStrictEqual(adapter.options, {
        interval: 1000,
        eventName: "$metrics.changed",
      });
    });

    it("should initialize with custom event name", () => {
      const customAdapter = exporterResolver.Event.default({
        eventName: "custom.metrics",
        interval: 2000,
      }) as unknown as TestAdapter;

      customAdapter.init(mockRegistry);

      assert.strictEqual(customAdapter.options?.eventName, "custom.metrics");
      assert.strictEqual(customAdapter.options?.interval, 2000);
    });

    it("should store registry reference during init", () => {
      adapter.init(mockRegistry);
      assert.strictEqual(adapter.registry, mockRegistry);
    });

    it("should set up timer when interval > 0", (t, done) => {
      adapter.init(mockRegistry);

      assert.notStrictEqual(adapter.timer, undefined);

      // Wait for timer to fire
      setTimeout(() => {
        assert.ok(mockBroker.emit.mock.callCount() >= 1);
        done();
      }, 1100);
    });

    it("should not set up timer when interval is 0", () => {
      const zeroIntervalAdapter = exporterResolver.Event.default({
        interval: 0,
      }) as unknown as TestAdapter;
      zeroIntervalAdapter.init(mockRegistry);

      assert.strictEqual(zeroIntervalAdapter.timer, undefined);
    });

    it("should clear timer on stop", async () => {
      adapter.init(mockRegistry);
      const timerId = adapter.timer;

      assert.notStrictEqual(timerId, undefined);

      const stopPromise = adapter.stop();

      assert.ok(stopPromise instanceof Promise);
      await stopPromise;
    });

    it("should track metric changes", () => {
      const metric = { name: "test.metric", value: 123 };

      // Should not throw
      assert.doesNotThrow(() => {
        adapter.metricChanged?.(metric);
      });
    });

    it("should emit metrics list when timer fires", (t, done) => {
      const testMetrics = [
        { name: "metric1", value: 10 },
        { name: "metric2", value: 20 },
      ];

      mockRegistry.list = mock.fn(() => testMetrics);
      adapter.init(mockRegistry);

      setTimeout(() => {
        assert.ok(mockBroker.emit.mock.callCount() >= 1);
        assert.ok(mockRegistry.list.mock.callCount() >= 1);
        done();
      }, 1100);
    });
  });

  describe("Module exports", () => {
    it("should export Base adapter", () => {
      assert.notStrictEqual(exporterResolver.Base, undefined);
      assert.strictEqual(typeof exporterResolver.Base, "object");
      assert.strictEqual(typeof exporterResolver.Base.default, "function");
    });

    it("should export Event adapter", () => {
      assert.notStrictEqual(exporterResolver.Event, undefined);
      assert.strictEqual(typeof exporterResolver.Event, "object");
      assert.strictEqual(typeof exporterResolver.Event.default, "function");
    });

    it("should export resolve function", () => {
      assert.notStrictEqual(exporterResolver.resolve, undefined);
      assert.strictEqual(typeof exporterResolver.resolve, "function");
    });
  });
});
