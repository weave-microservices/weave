const BaseSerializer = require('./base')

const makeJsonSerializer = (options) => {
    const self = BaseSerializer(options)

    return Object.assign(self, {
        serialize (obj) {
            return Buffer.from(JSON.stringify(obj))
        },
        deserialize (buffer) {
            return JSON.parse(buffer)
        }
    })
}

module.exports = makeJsonSerializer
