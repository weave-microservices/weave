// import utils from '../../../lib/utils.mts';

import Middleware from '../../../lib/middlewares/metrics.mts';
import { createNode } from '../../helper/index.mts';
// import Context from '../../../lib/broker/context.mts';

const config = {
  logger: {
    enabled: false,
    level: 'fatal'
  },
  metrics: {
    enabled: true
  }
};
// import SlowService from '../../services/slow.service.mts';
import { describe, it } from 'node:test';
import assert from 'node:assert/strict';

describe('Test metrics middleware', () => {
  const broker = createNode(config);
  // const contentFactory = createContextFactory()
  // const handler = jest.fn(() => Promise.resolve('hooray!!!'))
  const middleware = Middleware(broker.runtime);

  // const endpoint = {
  //   action,
  //   node: {
  //     id: broker.nodeId
  //   }
  // }

  it('should register hooks', () => {
    assert.notStrictEqual(middleware.localAction, undefined);
  });
});
