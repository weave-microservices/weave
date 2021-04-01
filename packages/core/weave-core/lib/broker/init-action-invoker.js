const { WeaveError } = require('../errors')

exports.initActionInvoker = (runtime) => {
  const { registry, contextFactory, log, handleError } = runtime

  /**
   * Call a action.
   * @param {string} actionName Name of the action.
   * @param {any} data Action parameters
   * @param {Object} [opts={}] Options
   * @returns {Promise} Promise
  */
  const call = (actionName, data, opts = {}) => {
    const endpoint = registry.getNextAvailableActionEndpoint(actionName, opts)

    if (endpoint instanceof Error) {
      return Promise.reject(endpoint)
        .catch(error => handleError(error))
    }

    const action = endpoint.action
    const nodeId = endpoint.node.id
    let context

    if (opts.context !== undefined) {
      context = opts.context
      context.nodeId = nodeId
    } else {
      context = contextFactory.create(endpoint, data, opts)
    }

    if (endpoint.isLocal) {
      log.debug('Call action local.', { action: actionName, requestId: context.requestId })
    } else {
      log.debug('Call action on remote node.', { action: actionName, nodeId, requestId: context.requestId })
    }

    const p = action.handler(context, endpoint.service, runtime)

    p.context = context

    return p
  }

  /**
   * Call multiple actions.
   * @param {Array<Action>} actions Array of actions.
   * @returns {Promise} Promise
  */
  const multiCall = (actions) => {
    if (Array.isArray(actions)) {
      return Promise.all(actions.map(item => call(item.actionName, item.params, item.options)))
    } else {
      return Promise.reject(new WeaveError('Actions need to be an Array'))
    }
  }

  Object.defineProperty(runtime, 'actionInvoker', {
    value: {
      call,
      multiCall
    }
  })
}
