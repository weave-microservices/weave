const defineAction = require('../../lib/helper/defineAction');
const defineBrokerOptions = require('../../lib/helper/defineBrokerOptions');
const defineService = require('../../lib/helper/defineService');

describe('Helper Functions', () => {
  describe('defineAction', () => {
    it('should return the action definition', () => {
      const actionDef = {
        name: 'testAction',
        handler: jest.fn()
      };

      const result = defineAction(actionDef);
      expect(result).toBe(actionDef);
    });

    it('should return complex action definitions', () => {
      const actionDef = {
        name: 'complexAction',
        params: {
          name: 'string',
          age: 'number'
        },
        handler: jest.fn(),
        cache: true,
        timeout: 5000
      };

      const result = defineAction(actionDef);
      expect(result).toBe(actionDef);
      expect(result.params).toBeDefined();
      expect(result.cache).toBe(true);
      expect(result.timeout).toBe(5000);
    });
  });

  describe('defineBrokerOptions', () => {
    it('should return the broker options', () => {
      const options = {
        nodeId: 'test-node',
        logger: { enabled: true },
        transport: { adapter: 'dummy' }
      };

      const result = defineBrokerOptions(options);
      expect(result).toBe(options);
    });

    it('should return complex broker options', () => {
      const options = {
        nodeId: 'complex-node',
        namespace: 'test',
        logger: {
          enabled: true,
          level: 'debug'
        },
        transport: {
          adapter: 'tcp',
          options: {
            port: 4222
          }
        },
        metrics: {
          enabled: true
        }
      };

      const result = defineBrokerOptions(options);
      expect(result).toBe(options);
      expect(result.namespace).toBe('test');
      expect(result.logger.level).toBe('debug');
      expect(result.transport.options.port).toBe(4222);
    });
  });

  describe('defineService', () => {
    it('should return the service definition', () => {
      const serviceDef = {
        name: 'testService',
        actions: {
          test: jest.fn()
        }
      };

      const result = defineService(serviceDef);
      expect(result).toBe(serviceDef);
    });

    it('should return complex service definitions', () => {
      const serviceDef = {
        name: 'complexService',
        version: 2,
        settings: {
          timeout: 5000
        },
        mixins: [],
        actions: {
          action1: {
            params: {
              name: 'string'
            },
            handler: jest.fn()
          },
          action2: jest.fn()
        },
        events: {
          'user.created': jest.fn()
        },
        created: jest.fn(),
        started: jest.fn(),
        stopped: jest.fn()
      };

      const result = defineService(serviceDef);
      expect(result).toBe(serviceDef);
      expect(result.version).toBe(2);
      expect(result.settings.timeout).toBe(5000);
      expect(result.actions.action1.params).toBeDefined();
      expect(result.events['user.created']).toBeDefined();
    });

    it('should handle service with minimal definition', () => {
      const serviceDef = {
        name: 'minimalService'
      };

      const result = defineService(serviceDef);
      expect(result).toBe(serviceDef);
      expect(result.name).toBe('minimalService');
    });
  });
});
