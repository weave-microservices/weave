const { isPlainObject } = require('../utils')

exports.mergeOptions = (parent, child) => {
    normalizeParams(child)
}

const normalizeParams = options => {
    const properties = options.properties
    if (!properties) {
        return
    }
}
