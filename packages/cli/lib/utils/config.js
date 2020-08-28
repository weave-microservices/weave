const path = require('path')
const fs = require('fs')
const { isString } = require('@weave-js/utils')
const { getDefaultOptions } = require('@weave-js/core').defaultOptions

const defaultConfigFileName = 'weave.config.js'

exports.getConfig = (flags) => {
  let filePath
  if (flags.config && isString(flags.config)) {
    filePath = path.isAbsolute(flags.config) ? flags.config : path.resolve(process.cwd(), flags.config)
  }

  if (!filePath && fs.existsSync(path.resolve(process.cwd(), defaultConfigFileName))) {
    filePath = path.resolve(process.cwd(), defaultConfigFileName)
  }

  if (!filePath && fs.existsSync(path.resolve(process.cwd(), defaultConfigFileName))) {
    filePath = path.resolve(process.cwd(), defaultConfigFileName)
  }

  if (filePath) {
    if (!fs.existsSync(filePath)) {
      throw new Error(`Config file not found: ${filePath}`)
    }

    const fileExtension = path.extname(filePath)

    // check file extension
    switch (fileExtension) {
    case '.json':
    case '.js': {
      return require(filePath)
    }
    default:
      throw new Error(`Not supported file extension: ${fileExtension}`)
    }
  }

  return getDefaultOptions()
}
