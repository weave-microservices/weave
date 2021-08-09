/**
 * @typedef {Object} ErrorDefinition
 * @property {}
*/

/**
 * 
 * @param {*} errorDefinitions 
 * @returns 
 */
module.exports = (errorDefinitions) => {
  const errors = {}

  for (const errorName in errorDefinitions) {
    const errorDefinition = errorDefinitions[errorName]
    const { baseClass = Error, code = `E${errorName.toUpperCase()}` } = errorDefinition

    errors[errorName] = class extends baseClass {
      constructor (message, { cause, data } = {}) {
        super()
        this.name = errorName
        this.code = code
        this.message = message
        this.cause = cause
        this.data = data
      }
    }
  }

  return errors
}
