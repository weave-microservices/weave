import { defaultsDeep } from "@weave-js/utils";
import { Weave } from "../../lib/index.mts";
import type { BrokerOptions, ServiceSchema } from "../../types/index.js";

export const createNode = (options: BrokerOptions, services: ServiceSchema[] = []) => {
  const mergedOptions = defaultsDeep(options, {
    logger: {
      enabled: false,
    },
  }) as BrokerOptions;

  const broker = Weave(mergedOptions);
  if (services && services.length > 0) {
    services.forEach((schema) => broker.createService(Object.assign({}, schema)));
  }
  return broker;
};
