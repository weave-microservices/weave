import type { Broker, Registry } from "../../../types/index.js";

export default (broker: Broker, _registry: Registry) => {
  return {
    next(/* endpointList,context*/) {
      broker.handleError(new Error("Method not implemented!"));
    },
  };
};
