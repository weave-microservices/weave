const { isFunction } = require('./is-function')

exports.wrapHandler = (action) => isFunction(action) ? { handler: action } : action
