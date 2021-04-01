const utils = require('./utils')

exports.format = (formatFunction) => ({
  transform (info, loggerOptions) {
    return formatFunction({ info, utils, loggerOptions })
  }
})
