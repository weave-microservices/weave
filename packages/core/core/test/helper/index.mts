import { defaultsDeep } from '@weave-js/utils';
import { Weave } from '../../lib/index.mts';

export const createNode = (options, services = []) => {
  options = defaultsDeep(options, {
    logger: {
      enabled: false
    }
  });

  const broker = Weave(options, services);
  if (services) {
    services.map(schema => broker.createService(Object.assign({}, schema)));
  }
  return broker;
};
