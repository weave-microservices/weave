const utils = require('./utils')

exports.format = (formatFunction) => {

  const createFormatWrap = (options = {}) => ({
    options,
    transform (info, loggerOptions) {
      return formatFunction({ info, utils, options, loggerOptions })
    }  
  })

  return createFormatWrap
}
