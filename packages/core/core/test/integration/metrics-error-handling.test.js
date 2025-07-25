const { createNode } = require('../helper');

describe('Metrics Error Handling with Promise.allSettled()', () => {
  let broker;

  afterEach(async () => {
    if (broker && broker.runtime.state.isStarted) {
      await broker.stop();
    }
  });

  describe('Metrics adapter stop failures', () => {
    it('should handle multiple metrics adapter stop failures gracefully', async () => {
      const mockAdapter1 = {
        init: jest.fn(),
        stop: jest.fn().mockRejectedValue(new Error('Adapter 1 stop failed'))
      };

      const mockAdapter2 = {
        init: jest.fn(),
        stop: jest.fn().mockRejectedValue(new Error('Adapter 2 stop failed'))
      };

      const mockAdapter3 = {
        init: jest.fn(),
        stop: jest.fn().mockResolvedValue()
      };

      broker = createNode({
        nodeId: 'metrics-error-test',
        logger: { enabled: false },
        metrics: {
          enabled: true,
          adapters: [mockAdapter1, mockAdapter2, mockAdapter3]
        }
      });

      await broker.start();

      // Should complete stop despite adapter failures
      await expect(broker.stop()).resolves.toBeUndefined();

      expect(mockAdapter1.stop).toHaveBeenCalled();
      expect(mockAdapter2.stop).toHaveBeenCalled();
      expect(mockAdapter3.stop).toHaveBeenCalled();
    });

    it('should handle single metrics adapter stop failure', async () => {
      const mockAdapter = {
        init: jest.fn(),
        stop: jest.fn().mockRejectedValue(new Error('Single adapter stop failed'))
      };

      broker = createNode({
        nodeId: 'single-metrics-error-test',
        logger: { enabled: false },
        metrics: {
          enabled: true,
          adapters: [mockAdapter]
        }
      });

      await broker.start();

      // Should complete stop despite adapter failure
      await expect(broker.stop()).resolves.toBeUndefined();
      expect(mockAdapter.stop).toHaveBeenCalled();
    });

    it('should handle mixed success and failure in metrics adapters', async () => {
      const successAdapter = {
        init: jest.fn(),
        stop: jest.fn().mockResolvedValue()
      };

      const failureAdapter = {
        init: jest.fn(),
        stop: jest.fn().mockRejectedValue(new Error('Adapter failure'))
      };

      broker = createNode({
        nodeId: 'mixed-metrics-test',
        logger: { enabled: false },
        metrics: {
          enabled: true,
          adapters: [successAdapter, failureAdapter]
        }
      });

      await broker.start();
      await expect(broker.stop()).resolves.toBeUndefined();

      expect(successAdapter.stop).toHaveBeenCalled();
      expect(failureAdapter.stop).toHaveBeenCalled();
    });

    it('should handle metrics stop when no adapters are configured', async () => {
      broker = createNode({
        nodeId: 'no-adapters-test',
        logger: { enabled: false },
        metrics: {
          enabled: true,
          adapters: []
        }
      });

      await broker.start();
      await expect(broker.stop()).resolves.toBeUndefined();
    });

    it('should handle metrics stop when adapters is undefined', async () => {
      broker = createNode({
        nodeId: 'undefined-adapters-test',
        logger: { enabled: false },
        metrics: {
          enabled: true
        }
      });

      await broker.start();
      await expect(broker.stop()).resolves.toBeUndefined();
    });
  });

  describe('Metrics initialization errors', () => {
    it('should handle metrics adapter validation errors', () => {
      expect(() => {
        broker = createNode({
          nodeId: 'metrics-validation-test',
          logger: { enabled: false },
          metrics: {
            enabled: true,
            adapters: 'not-an-array' // Should cause validation error
          }
        });
      }).toThrow('Metic adapter needs to be an Array.');
    });

    it('should handle successful metrics operations', async () => {
      const mockAdapter = {
        init: jest.fn(),
        stop: jest.fn().mockResolvedValue()
      };

      broker = createNode({
        nodeId: 'successful-metrics-test',
        logger: { enabled: false },
        metrics: {
          enabled: true,
          adapters: [mockAdapter]
        }
      });

      await broker.start();

      // Register a test metric
      const metric = broker.runtime.metrics.register({
        type: 'counter',
        name: 'test.counter',
        description: 'Test counter'
      });

      expect(metric).toBeDefined();

      await broker.stop();
      expect(mockAdapter.stop).toHaveBeenCalled();
    });
  });
});
