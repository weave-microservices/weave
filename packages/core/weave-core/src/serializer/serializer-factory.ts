const JSONSerializer = require('./json')

export function createSerializerFactory({ getLogger, options }) {
  const serializer = options.serializer || JSONSerializer
  serializer.init({ getLogger })
  return serializer
}
