import { createBaseSerializer } from './base'

export function makeJsonSerializer(options) {
  const self = createBaseSerializer(options)

  return Object.assign(self, {
    serialize (obj) {
      return Buffer.from(JSON.stringify(obj))
    },
    deserialize (buffer) {
      return JSON.parse(buffer)
    }
  })
}
