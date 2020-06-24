const { isFunction } = require('./is-function')
module.exports.wrapHandler = action => isFunction(action) ? { handler: action } : action
