const { WeaveMaxCallLevelError } = require('../../errors')

exports.createCall = (context, broker) => ({
  /**
   * Call a action.
   * @param {string} actionName Name of the action.
   * @param {object} params Parameter
   * @param {object} [options={}] Call options
   * @returns {Promise} Promise
  */
  call (actionName, params, options = {}) {
    options.parentContext = this
    if (options.maxCallLevel < this.level) {
      return Promise.reject(new WeaveMaxCallLevelError(broker.nodeId, context.level))
    }

    const p = broker.call(actionName, params, options)

    return p.then(result => {
      if (p.context) {
        context.meta = Object.assign(context.meta, p.context.meta)
      }
      return result
    })
  }
})
