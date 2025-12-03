// const { createBroker } = require('../../../packages/core/core/lib/index.mts');
import { createBroker } from '../../../packages/core/core/lib/index.mts';

const broker = createBroker({
  logger: {
    level: 'debug'
  }
});

broker.createService({
  name: 'test',
  actions: {
    hello: {
      params: {
        name: 'string'
      },
      handler (context) {
        context.data;
      }
    }
  }
});

broker.log.info({ name: 'Kevin' });
broker.log.error(new Error('asdassds'));
broker.log.debug('debug');
broker.log.fatal('fatal');
broker.log.verbose('verbose');
broker.log.warn('warn');
broker.log.info({ node: 123, name: 'sdasdas' }, 'test');
broker.log.info('test', { node: 123, name: 'sdasdas' });


await broker.start();
await broker.call('test.hello');
