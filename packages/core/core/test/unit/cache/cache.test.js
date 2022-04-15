const { createCacheBase } = require('../../../src/cache/adapters/base');
const cacheMiddleware = require('../../../src/middlewares/cache/index');
const { createFakeRuntime } = require('../../helper/runtime');
const { createNode } = require('../../helper');
const { WeaveError } = require('../../../src/errors');

describe('Test cache base errors', () => {
  const broker = createNode({
    logger: {
      enabled: false
    }
  });

  it('should throw an error if the cache name is not a string.', () => {
    try {
      createCacheBase(broker, {});
    } catch (error) {
      expect(error instanceof WeaveError).toBe(true);
      expect(error.message).toBe('Name must be a string.');
    }
  });
});

describe('Test cache hash creation', () => {
  const broker = createNode({
    logger: {
      enabled: false
    }
  });
  const cacheBase = createCacheBase('a-name', broker, {});

  it('should return the action name if no parameter was passed,', () => {
    const hash = cacheBase.getCachingKey('testAction');
    expect(hash).toEqual('testAction');
  });

  it('should return the hashed value for the request.', () => {
    const hash = cacheBase.getCachingKey('testAction', { a: 3, b: 2, c: '3' });
    expect(hash).toEqual('testAction.oL5syHSbxJsftXqJ7IaaqzuwmMU=');
    expect(hash.length).toBe(39);
  });

  it('should return the hashed value for the request with all kind of types', () => {
    const hash = cacheBase.getCachingKey('testAction', { a: 3, b: 2, c: '3', d: null, e: { a1: 'asd', a2: 123, a3: { a1: 234, a2: true, a3: null, a4: Symbol('abc') }}}, { user: { id: '1234' }}, ['id', 'd', 'e', ':user.id']);
    expect(hash).toEqual('testAction.rSpCMtm5NKgVW72K90ZERJ380kU=');
    expect(hash.length).toBe(39);
  });
});

describe('Test cache middleware', () => {
  const handler = jest.fn(() => Promise.resolve('hooray!!!'));
  const service = {};

  it('should be defined', () => {
    const action = {
      name: 'math.add',
      handler,
      service
    };
    const middleware = cacheMiddleware(handler, action);
    expect(middleware).toBeDefined();
  });

  it('should not wrap handler if cache settings are not set', () => {
    const action = {
      name: 'math.add',
      handler,
      service
    };
    const runtime = createFakeRuntime({
      cache: {
        lock: {
          enabled: false
        }
      }
    });

    const newHandler = cacheMiddleware(runtime).localAction(handler, action);
    expect(newHandler).toBe(handler);
  });

  it('should wrap handler if cache settings are set', () => {
    const action = {
      name: 'math.add',
      cache: {
        keys: ['p']
      },
      handler,
      service
    };
    const newHandler = cacheMiddleware(handler, action);
    expect(newHandler).not.toBe(handler);
  });
});
