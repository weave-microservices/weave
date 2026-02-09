import type { Broker, Registry } from "../../../types/index.js";

export default (broker: Broker, registry: Registry) => {
  return {
    next(/* endpointList,context*/) {
      broker.handleError(new Error("Method not implemented!"));
    },
  };
};
