const JSONSerializer = require('./json')

const makeSerializerFactory = ({ getLogger, options }) =>
  () => {
    const serializer = options.serializer || JSONSerializer
    serializer.init({ getLogger })
    return serializer
  }

module.exports = makeSerializerFactory
