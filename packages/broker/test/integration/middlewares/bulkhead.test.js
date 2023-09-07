
const { createNode } = require('../../helper');
describe('Test bulkhead middleware', () => {
  it('should throw an error if the bulkhead queue exceeds', async () => {
    const broker = createNode({
      bulkhead: {
        enabled: true,
        maxQueueSize: 20
      }
    });

    broker.createService({
      name: 'pusher1',
      actions: {
        push () {
          return new Promise(resolve => {
            setTimeout(() => resolve(true), 2000);
          });
        }
      }
    });

    await broker.start();
    try {
      await Promise.all(Array.from(Array(25), (_, x) => x).map((i) => {
        return broker.call('pusher1.push');
      }));
    } catch (error) {
      expect(error.type).toBe('WEAVE_QUEUE_SIZE_EXCEEDED_ERROR');
      expect(error.retryable).toBe(false);
      expect(error.message).toBe('Queue size limit was exceeded. Request rejected.');
      expect(error.data).toEqual({
        action: 'pusher1.push',
        limit: 20,
        size: 21
      });
    }
    await broker.stop();
  });
});
