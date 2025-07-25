const { createNode } = require('../helper');

describe('EventBus Error Handling with Promise.allSettled()', () => {
  let broker1, broker2, broker3;

  afterEach(async () => {
    if (broker1 && broker1.runtime.state.isStarted) await broker1.stop();
    if (broker2 && broker2.runtime.state.isStarted) await broker2.stop();
    if (broker3 && broker3.runtime.state.isStarted) await broker3.stop();
  });

  describe('Event emit error handling', () => {
    it('should handle event handler failures gracefully during emit', async () => {
      broker1 = createNode({
        nodeId: 'emit-test-1',
        logger: { enabled: false }
      });

      // Create services with event handlers that fail
      broker1.createService({
        name: 'eventService1',
        events: {
          'test.event': {
            handler () {
              throw new Error('Event handler 1 failed');
            }
          }
        }
      });

      broker1.createService({
        name: 'eventService2',
        events: {
          'test.event': {
            handler () {
              throw new Error('Event handler 2 failed');
            }
          }
        }
      });

      broker1.createService({
        name: 'eventService3',
        events: {
          'test.event': {
            handler () {
              return 'success';
            }
          }
        }
      });

      await broker1.start();

      // Emit should complete despite handler failures
      const results = await broker1.emit('test.event', { data: 'test' });
      expect(results).toBeDefined();
      expect(Array.isArray(results)).toBe(true);
    });

    it('should handle single event handler failure during emit', async () => {
      broker1 = createNode({
        nodeId: 'single-emit-test',
        logger: { enabled: false }
      });

      broker1.createService({
        name: 'eventService',
        events: {
          'test.event': {
            handler () {
              throw new Error('Single event handler failed');
            }
          }
        }
      });

      await broker1.start();

      const results = await broker1.emit('test.event', { data: 'test' });
      expect(results).toBeDefined();
    });

    it('should handle successful event emission', async () => {
      broker1 = createNode({
        nodeId: 'successful-emit-test',
        logger: { enabled: false }
      });

      const handler1 = jest.fn().mockReturnValue('result1');
      const handler2 = jest.fn().mockReturnValue('result2');

      broker1.createService({
        name: 'eventService1',
        events: {
          'test.event': { handler: handler1 }
        }
      });

      broker1.createService({
        name: 'eventService2',
        events: {
          'test.event': { handler: handler2 }
        }
      });

      await broker1.start();

      const results = await broker1.emit('test.event', { data: 'test' });
      expect(results).toBeDefined();
      expect(handler1).toHaveBeenCalled();
      expect(handler2).toHaveBeenCalled();
    });
  });

  describe('Event broadcast error handling', () => {
    it('should handle broadcast failures to remote nodes', async () => {
      broker1 = createNode({
        nodeId: 'broadcast-test-1',
        logger: { enabled: false },
        transport: { adapter: 'dummy' }
      });

      broker2 = createNode({
        nodeId: 'broadcast-test-2',
        logger: { enabled: false },
        transport: { adapter: 'dummy' }
      });

      broker1.createService({
        name: 'eventService1',
        events: {
          'test.broadcast': {
            handler () {
              return 'local success';
            }
          }
        }
      });

      broker2.createService({
        name: 'eventService2',
        events: {
          'test.broadcast': {
            handler () {
              throw new Error('Remote handler failed');
            }
          }
        }
      });

      await Promise.all([broker1.start(), broker2.start()]);

      // Broadcast should complete despite remote failures
      const results = await broker1.broadcast('test.broadcast', { data: 'test' });
      expect(results).toBeDefined();
      expect(Array.isArray(results)).toBe(true);
    });

    it('should handle mixed success and failure in broadcast', async () => {
      broker1 = createNode({
        nodeId: 'mixed-broadcast-1',
        logger: { enabled: false },
        transport: { adapter: 'dummy' }
      });

      broker2 = createNode({
        nodeId: 'mixed-broadcast-2',
        logger: { enabled: false },
        transport: { adapter: 'dummy' }
      });

      broker3 = createNode({
        nodeId: 'mixed-broadcast-3',
        logger: { enabled: false },
        transport: { adapter: 'dummy' }
      });

      broker1.createService({
        name: 'localService',
        events: {
          'test.mixed': {
            handler () {
              return 'local success';
            }
          }
        }
      });

      broker2.createService({
        name: 'remoteService1',
        events: {
          'test.mixed': {
            handler () {
              return 'remote success';
            }
          }
        }
      });

      broker3.createService({
        name: 'remoteService2',
        events: {
          'test.mixed': {
            handler () {
              throw new Error('Remote failure');
            }
          }
        }
      });

      await Promise.all([broker1.start(), broker2.start(), broker3.start()]);

      const results = await broker1.broadcast('test.mixed', { data: 'test' });
      expect(results).toBeDefined();
    });

    it('should handle broadcastLocal with handler failures', async () => {
      broker1 = createNode({
        nodeId: 'local-broadcast-test',
        logger: { enabled: false }
      });

      broker1.createService({
        name: 'localService1',
        events: {
          'test.local': {
            handler () {
              throw new Error('Local handler 1 failed');
            }
          }
        }
      });

      broker1.createService({
        name: 'localService2',
        events: {
          'test.local': {
            handler () {
              return 'local success';
            }
          }
        }
      });

      await broker1.start();

      // broadcastLocal should handle failures gracefully
      await expect(broker1.broadcastLocal('test.local', { data: 'test' })).resolves.toBeDefined();
    });
  });

  describe('Event system edge cases', () => {
    it('should handle events with no listeners', async () => {
      broker1 = createNode({
        nodeId: 'no-listeners-test',
        logger: { enabled: false }
      });

      await broker1.start();

      // Should not throw when emitting to event with no listeners
      await expect(broker1.emit('nonexistent.event', { data: 'test' })).resolves.toBeDefined();
      await expect(broker1.broadcast('nonexistent.event', { data: 'test' })).resolves.toBeDefined();
    });

    it('should handle system events properly', async () => {
      broker1 = createNode({
        nodeId: 'system-events-test',
        logger: { enabled: false }
      });

      await broker1.start();

      // System events (starting with $) should work without issues
      await expect(broker1.emit('$test.system', { data: 'test' })).resolves.toBeDefined();
      await expect(broker1.broadcast('$test.system', { data: 'test' })).resolves.toBeDefined();
    });

    it('should handle events with groups', async () => {
      broker1 = createNode({
        nodeId: 'groups-test',
        logger: { enabled: false }
      });

      broker1.createService({
        name: 'groupService',
        events: {
          'test.groups': {
            group: 'testGroup',
            handler () {
              return 'group success';
            }
          }
        }
      });

      await broker1.start();

      await expect(broker1.emit('test.groups', { data: 'test' }, ['testGroup'])).resolves.toBeDefined();
      await expect(broker1.broadcast('test.groups', { data: 'test' }, { groups: ['testGroup'] })).resolves.toBeDefined();
    });
  });
});
