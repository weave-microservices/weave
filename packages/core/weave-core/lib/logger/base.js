const { isStandardLevel, levelMethods } = require('./levels')
const { noop, generateLogMethod, asJsonString } = require('./tools')

exports.initBase = (runtime) => {
  runtime.setLevel = (level) => {
    const { labels, values } = runtime.levels
    if (typeof level === 'number') {
      if (labels[level] === undefined) throw Error('unknown level value' + level)
      level = labels[level]
    }

    if (values[level] === undefined) throw Error('unknown level ' + level)
    // const preLevelVal = this[levelValSym]
    const levelVal = runtime.levelValue = values[level]
    const useOnlyCustomLevelsVal = runtime.options.useOnlyCustomLevelsSym
    const hook = runtime.options.hooks.logMethod

    for (const key in values) {
      if (levelVal > values[key]) {
        runtime.logMethods[key] = noop
        continue
      }
      runtime.logMethods[key] = isStandardLevel(key, useOnlyCustomLevelsVal) ? levelMethods[key](runtime, hook) : generateLogMethod(runtime, values[key], hook)
    }
  }

  runtime.write = (originObj, message, number) => {
    const isErrorObject = originObj instanceof Error
    const mixin = runtime.mixin
    const time = Date.now()
    let object

    if (originObj === undefined || originObj === null) {
      object = mixin ? mixin({}) : {}
    } else {
      object = Object.assign(mixin ? mixin(originObj) : {}, originObj)

      if (!message && isErrorObject) {
        message = originObj.message
      }

      if (isErrorObject) {
        object.stack = originObj.stack
        if (!object.type) {
          object.type = 'Error'
        }
      }
    }

    const logString = asJsonString(runtime, object, message, number, time)

    runtime.stream.write(logString)
  }
}
