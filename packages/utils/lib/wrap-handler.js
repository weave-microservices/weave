module.exports.wrapHandler = action => module.exports.isFunction(action) ? { handler: action } : action
