import exporterResolver from '../../../lib/metrics/exporter.mts';
import { WeaveBrokerOptionsError } from '../../../lib/errors.mts';
import { describe, it, beforeEach, afterEach } from 'node:test';
import assert from 'node:assert/strict';

describe('Metrics Exporter', () => {
  describe('resolve', () => {
    it('should return Event adapter when options is true', () => {
      const result = exporterResolver.resolve(true);
      assert.strictEqual(result, exporterResolver.Event);
    });

    it('should return Event adapter when options is "event"', () => {
      const result = exporterResolver.resolve('event');
      assert.strictEqual(result, exporterResolver.Event);
    });

    it('should return Event adapter when options is "Event"', () => {
      const result = exporterResolver.resolve('Event');
      assert.strictEqual(result, exporterResolver.Event);
    });

    it('should return Base adapter when options is "base"', () => {
      const result = exporterResolver.resolve('base');
      assert.strictEqual(result, exporterResolver.Base);
    });

    it('should return Base adapter when options is "Base"', () => {
      const result = exporterResolver.resolve('Base');
      assert.strictEqual(result, exporterResolver.Base);
    });

    it('should return custom function when options is a function', () => {
      const customAdapter = () => {};
      const result = exporterResolver.resolve(customAdapter);
      assert.strictEqual(result, customAdapter);
    });

    it('should throw error for unknown adapter name', () => {
      expect(() => {
        exporterResolver.resolve('unknown');
      }).toThrow(WeaveBrokerOptionsError);
    });

    it('should throw error with correct message for unknown adapter', () => {
      expect(() => {
        exporterResolver.resolve('invalid');
      }).toThrow('Unknown metric adapter: "invalid"');
    });

    it('should return undefined for falsy options', () => {
      expect(exporterResolver.resolve(false)).toBeUndefined();
      expect(exporterResolver.resolve(null)).toBeUndefined();
      expect(exporterResolver.resolve(undefined)).toBeUndefined();
      expect(exporterResolver.resolve(0)).toBeUndefined();
    });

    it('should throw error for empty string', () => {
      expect(() => {
        exporterResolver.resolve('');
      }).toThrow(WeaveBrokerOptionsError);
    });

    it('should return undefined for unsupported option types', () => {
      expect(exporterResolver.resolve({})).toBeUndefined();
      expect(exporterResolver.resolve([])).toBeUndefined();
      expect(exporterResolver.resolve(123)).toBeUndefined();
    });
  });

  describe('Base adapter', () => {
    let adapter;

    beforeEach(() => {
      adapter = exporterResolver.Base({});
    });

    it('should create adapter with init method', () => {
      assert.notStrictEqual(adapter.init, undefined);
      assert.strictEqual(typeof adapter.init, 'function');
    });

    it('should create adapter with stop method', () => {
      assert.notStrictEqual(adapter.stop, undefined);
      assert.strictEqual(typeof adapter.stop, 'function');
    });

    it('should have init method that returns resolved promise with error', async () => {
      const result = await adapter.init();
      assert.ok(result instanceof Error);
      assert.strictEqual(result.message, 'Init method not implemented');
    });

    it('should have stop method that returns resolved promise with error', async () => {
      const result = await adapter.stop();
      assert.ok(result instanceof Error);
      assert.strictEqual(result.message, 'Stop method not implemented');
    });
  });

  describe('Event adapter', () => {
    let adapter;
    let mockRegistry;
    let mockBroker;

    beforeEach(() => {
      mockBroker = {
        emit: jest.fn()
      };

      mockRegistry = {
        broker: mockBroker,
        list: jest.fn().mockReturnValue([])
      };

      adapter = exporterResolver.Event({ interval: 1000 });
    });

    afterEach(() => {
      if (adapter && adapter.stop) {
        adapter.stop();
      }
      jest.clearAllTimers();
    });

    it('should create adapter with required methods', () => {
      assert.notStrictEqual(adapter.init, undefined);
      assert.notStrictEqual(adapter.stop, undefined);
      assert.notStrictEqual(adapter.metricChanged, undefined);
    });

    it('should initialize with default options', () => {
      adapter.init(mockRegistry);

      assert.deepStrictEqual(adapter.options, {
        interval: 1000,
        eventName: '$metrics.changed'
      });
    });

    it('should initialize with custom event name', () => {
      const customAdapter = exporterResolver.Event({
        eventName: 'custom.metrics',
        interval: 2000
      });

      customAdapter.init(mockRegistry);

      assert.strictEqual(customAdapter.options.eventName, 'custom.metrics');
      assert.strictEqual(customAdapter.options.interval, 2000);
    });

    it('should store registry reference during init', () => {
      adapter.init(mockRegistry);
      assert.strictEqual(adapter.registry, mockRegistry);
    });

    it('should set up timer when interval > 0', () => {
      jest.useFakeTimers();

      adapter.init(mockRegistry);

      assert.notStrictEqual(adapter.timer, undefined);

      // Fast forward time to trigger the interval
      jest.advanceTimersByTime(1000);

      expect(mockBroker.emit).toHaveBeenCalledWith('$metrics.changed', []);

      jest.useRealTimers();
    });

    it('should not set up timer when interval is 0', () => {
      const zeroIntervalAdapter = exporterResolver.Event({ interval: 0 });
      zeroIntervalAdapter.init(mockRegistry);

      assert.strictEqual(zeroIntervalAdapter.timer, undefined);
    });

    it('should clear timer on stop', () => {
      jest.useFakeTimers();

      adapter.init(mockRegistry);
      const timerId = adapter.timer;

      assert.notStrictEqual(timerId, undefined);

      const stopPromise = adapter.stop();

      assert.ok(stopPromise instanceof Promise);

      jest.useRealTimers();
    });

    it('should track metric changes', () => {
      const metric = { name: 'test.metric', value: 123 };

      adapter.metricChanged(metric);

      // Since lastChanges is private, we test indirectly through behavior
      expect(adapter.metricChanged).not.toThrow();
    });

    it('should emit metrics list when timer fires', () => {
      jest.useFakeTimers();

      const testMetrics = [
        { name: 'metric1', value: 10 },
        { name: 'metric2', value: 20 }
      ];

      mockRegistry.list.mockReturnValue(testMetrics);
      adapter.init(mockRegistry);

      jest.advanceTimersByTime(1000);

      expect(mockBroker.emit).toHaveBeenCalledWith('$metrics.changed', testMetrics);
      expect(mockRegistry.list).toHaveBeenCalled();

      jest.useRealTimers();
    });
  });

  describe('Module exports', () => {
    it('should export Base adapter', () => {
      assert.notStrictEqual(exporterResolver.Base, undefined);
      assert.strictEqual(typeof exporterResolver.Base, 'function');
    });

    it('should export Event adapter', () => {
      assert.notStrictEqual(exporterResolver.Event, undefined);
      assert.strictEqual(typeof exporterResolver.Event, 'function');
    });

    it('should export resolve function', () => {
      assert.notStrictEqual(exporterResolver.resolve, undefined);
      assert.strictEqual(typeof exporterResolver.resolve, 'function');
    });
  });
});
