const path = require('path')
const kleur = require('kleur')
const figures = require('figures')

module.exports = {
  kleur,
  figures,
  getISODate () {
    const date = new Date()
    return date.toISOString()
  },
  getFilename () {
    const tempStackTrace = Error.prepareStackTrace

    Error.prepareStackTrace = (_, stack) => stack

    const { stack } = new Error()

    Error.prepareStackTrace = tempStackTrace

    const callers = stack.map(x => x.getFileName())
    const firstExternalFilePath = callers.find(x => x !== callers[0])
    return firstExternalFilePath ? path.basename(firstExternalFilePath) : 'anonymous'
  }
}
