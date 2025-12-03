import Middleware from '../../../lib/middlewares/retry.mts';
import { WeaveRetryableError } from '../../../lib/errors.mts';
import { createNode } from '../../helper/index.mts';

const config = {
  logger: {
    enabled: false
  }
};
// import SlowService from '../../services/slow.service.mts';
import { describe, it } from 'node:test';
import assert from 'node:assert/strict';

describe('Test retry middleware', () => {
  const broker = createNode(config);
  const contextFactory = broker.runtime.contextFactory;
  const handler = jest.fn(() => Promise.resolve('hooray!!!'));
  const middleware = Middleware();
  const service = {};
  const action = {
    name: 'math.add',
    bulkhead: {
      enabled: false
    },
    handler,
    service
  };

  const endpoint = {
    action,
    node: {
      id: broker.nodeId
    },
    isLocal: true
  };

  it('should register middleware hooks', () => {
    assert.notStrictEqual(middleware.localAction, undefined);
    assert.notStrictEqual(middleware.remoteAction, undefined);
  });

  it('should not wrap handler if retry middleware is disabled', () => {
    broker.options.bulkhead.enabled = false;

    const newHandler = middleware.localAction.call(broker, handler, action);
    assert.strictEqual(newHandler, handler);
  });

  it('should not wrap handler if bulkhead is disabled', () => {
    broker.options.retryPolicy.enabled = true;

    const newHandler = middleware.localAction.call(broker, handler, action);
    expect(newHandler).not.toBe(handler);
  });

  it('should call the action 2 times bevore the requests get queued', (done) => {
    broker.options.retryPolicy.enabled = true;
    broker.options.retryPolicy.delay = 200;
    broker.options.retryPolicy.retries = 3;

    const error = new WeaveRetryableError('not this time');
    const handler = jest.fn(() => Promise.reject(error));
    const newHandler = middleware.localAction.call(broker, handler, action);

    const context = contextFactory.create(endpoint);
    context.setData({ name: 'Kevin' });

    broker.call = jest.fn(() => Promise.resolve('next call'));

    newHandler(context).then(() => {
      assert.strictEqual(context.retryCount, 1);

      expect(handler).toHaveBeenCalledTimes(1);
      expect(broker.call).toHaveBeenCalledTimes(1);
      expect(broker.call).toHaveBeenCalledWith('math.add', { name: 'Kevin' }, { context });
      done();
    });
  });

  it('should get rejected if all attempts fail', (done) => {
    broker.options.retryPolicy.enabled = true;
    broker.options.retryPolicy.delay = 200;
    broker.options.retryPolicy.retries = 0;

    const error = new WeaveRetryableError('not this time');
    const handler = jest.fn(() => Promise.reject(error));
    const newHandler = middleware.localAction.call(broker, handler, action);

    const context = contextFactory.create(endpoint);
    context.setData({ name: 'Kevin' });

    broker.call = jest.fn(() => Promise.resolve('next call'));

    newHandler(context)
      .catch(error => {
        assert.strictEqual(context.retryCount, 1);
        assert.strictEqual(error.message, 'not this time');
        done();
      });
  });

  it('should get rejected on remote actions', () => {});

  // it('should call the action 2 times immediately bevore the last requests get queued', (done) => {
  //   broker.options.bulkhead.enabled = true
  //   broker.options.bulkhead.concurrentCalls = 2
  //   broker.options.bulkhead.maxQueueSize = 10

  //   contentFactory.init(broker)
  //   let flow = []
  //   const handler = jest.fn((context) => {
  //     flow.push('handler-' + context.params.p)
  //     return new Promise(resolve => {
  //       setTimeout(() => resolve(), 10)
  //     })
  //   })
  //   const contexts = [...Array(20)].map((_, i) => contentFactory.create(endpoint, { p: i }))
  //   const wrappedHandler = middleware.localAction.call(broker, handler, action)

  //   Promise.all(contexts.map(context => wrappedHandler(context).catch(error => flow.push(error.name + '-' + context.params.p))))
  //   expect(handler).toBeCalledTimes(2)
  //   // assert.deepStrictEqual(flow, [
  //   //     'handler-0',
  //   //     'handler-1'
  //   // ])

  //   flow = []
  //   utils.promiseDelay(Promise.resolve(), 1000)
  //     .then(() => {
  //       expect(handler).toBeCalledTimes(13)
  //       assert.deepStrictEqual(flow, expect.arrayContaining([
  //         'handler-2',
  //         'handler-3',
  //         'handler-4',
  //         'handler-5',
  //         'handler-6',
  //         'handler-7',
  //         'handler-8',
  //         'handler-9'
  //       ]))
  //       done()
  //     })

  // assert.strictEqual(flow, handler)
  // })
});
