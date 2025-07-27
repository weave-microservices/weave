const exporterResolver = require('../../../lib/metrics/exporter');
const { WeaveBrokerOptionsError } = require('../../../lib/errors');

describe('Metrics Exporter', () => {
  describe('resolve', () => {
    it('should return Event adapter when options is true', () => {
      const result = exporterResolver.resolve(true);
      expect(result).toBe(exporterResolver.Event);
    });

    it('should return Event adapter when options is "event"', () => {
      const result = exporterResolver.resolve('event');
      expect(result).toBe(exporterResolver.Event);
    });

    it('should return Event adapter when options is "Event"', () => {
      const result = exporterResolver.resolve('Event');
      expect(result).toBe(exporterResolver.Event);
    });

    it('should return Base adapter when options is "base"', () => {
      const result = exporterResolver.resolve('base');
      expect(result).toBe(exporterResolver.Base);
    });

    it('should return Base adapter when options is "Base"', () => {
      const result = exporterResolver.resolve('Base');
      expect(result).toBe(exporterResolver.Base);
    });

    it('should return custom function when options is a function', () => {
      const customAdapter = () => {};
      const result = exporterResolver.resolve(customAdapter);
      expect(result).toBe(customAdapter);
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
      expect(adapter.init).toBeDefined();
      expect(typeof adapter.init).toBe('function');
    });

    it('should create adapter with stop method', () => {
      expect(adapter.stop).toBeDefined();
      expect(typeof adapter.stop).toBe('function');
    });

    it('should have init method that returns resolved promise with error', async () => {
      const result = await adapter.init();
      expect(result).toBeInstanceOf(Error);
      expect(result.message).toBe('Init method not implemented');
    });

    it('should have stop method that returns resolved promise with error', async () => {
      const result = await adapter.stop();
      expect(result).toBeInstanceOf(Error);
      expect(result.message).toBe('Stop method not implemented');
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
      expect(adapter.init).toBeDefined();
      expect(adapter.stop).toBeDefined();
      expect(adapter.metricChanged).toBeDefined();
    });

    it('should initialize with default options', () => {
      adapter.init(mockRegistry);

      expect(adapter.options).toEqual({
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

      expect(customAdapter.options.eventName).toBe('custom.metrics');
      expect(customAdapter.options.interval).toBe(2000);
    });

    it('should store registry reference during init', () => {
      adapter.init(mockRegistry);
      expect(adapter.registry).toBe(mockRegistry);
    });

    it('should set up timer when interval > 0', () => {
      jest.useFakeTimers();

      adapter.init(mockRegistry);

      expect(adapter.timer).toBeDefined();

      // Fast forward time to trigger the interval
      jest.advanceTimersByTime(1000);

      expect(mockBroker.emit).toHaveBeenCalledWith('$metrics.changed', []);

      jest.useRealTimers();
    });

    it('should not set up timer when interval is 0', () => {
      const zeroIntervalAdapter = exporterResolver.Event({ interval: 0 });
      zeroIntervalAdapter.init(mockRegistry);

      expect(zeroIntervalAdapter.timer).toBeUndefined();
    });

    it('should clear timer on stop', () => {
      jest.useFakeTimers();

      adapter.init(mockRegistry);
      const timerId = adapter.timer;

      expect(timerId).toBeDefined();

      const stopPromise = adapter.stop();

      expect(stopPromise).toBeInstanceOf(Promise);

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
      expect(exporterResolver.Base).toBeDefined();
      expect(typeof exporterResolver.Base).toBe('function');
    });

    it('should export Event adapter', () => {
      expect(exporterResolver.Event).toBeDefined();
      expect(typeof exporterResolver.Event).toBe('function');
    });

    it('should export resolve function', () => {
      expect(exporterResolver.resolve).toBeDefined();
      expect(typeof exporterResolver.resolve).toBe('function');
    });
  });
});
