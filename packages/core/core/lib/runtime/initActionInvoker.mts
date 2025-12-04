import * as errors from "../errors.mts";
import type { ActionOptions, Runtime } from "../../types/index.js";

export const initActionInvoker = (runtime: Runtime) => {
  const { registry, contextFactory, log, handleError } = runtime;

  const call = (actionName: string, data: object, opts: ActionOptions = {}) => {
    const endpoint = registry?.getNextAvailableActionEndpoint(actionName, opts);

    if (endpoint instanceof Error) {
      return Promise.reject(endpoint).catch((error) => handleError(error));
    }

    const action = endpoint.action;
    const nodeId = endpoint.node.id;
    let contextToUse;

    if (opts.context !== undefined) {
      contextToUse = opts.context;
      contextToUse.nodeId = nodeId;
    } else {
      contextToUse = contextFactory.create(endpoint, data, opts);
    }

    if (endpoint.isLocal) {
      log.debug(
        { action: contextToUse.action.name, requestId: contextToUse.requestId },
        "Call action local.",
      );
    } else {
      log.debug(
        { action: contextToUse.action.name, nodeId, requestId: contextToUse.requestId },
        "Call action on remote node.",
      );
    }

    const p = action.handler(contextToUse, {
      service: contextToUse.action.service,
      runtime,
      errors,
    });
    p.context = contextToUse;

    return p;
  };

  /**
   * Call multiple actions.
   * @param {Array<Action>} actions Array of actions.
   * @returns {Promise} Promise
   */
  const multiCall = (actions) => {
    if (Array.isArray(actions)) {
      return Promise.all(actions.map((item) => call(item.actionName, item.params, item.options)));
    } else {
      return Promise.reject(new errors.WeaveError("Actions need to be an Array"));
    }
  };

  Object.defineProperty(runtime, "actionInvoker", {
    value: {
      call,
      multiCall,
    },
  });
};
