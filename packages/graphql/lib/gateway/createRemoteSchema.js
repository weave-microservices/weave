const { introspectSchema, makeRemoteExecutableSchema } = require('graphql-tools')
const WeaveLink = require('./WeaveLink')

module.exports = async function createRemoteSchema ({ broker, service }) {
    const link = new WeaveLink({ broker, service })
    const schema = await introspectSchema(link)
    return makeRemoteExecutableSchema({ schema, link })
}
