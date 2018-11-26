const { graphql } = require('graphql')
const { makeExecutableSchema } = require('graphql-tools')

module.exports = ({
    typeName,
    schema,
    resolvers,
    relations,
    relationDefinitions
}) => ({
    settings: {
        typeName,
        schema,
        relations,
        relationDefinitions,
        hasGraphQLSchema: true
    },
    actions: {
        graphql: {
            params: {
                query: { type: 'string' },
                variables: { type: 'object', optional: true }
            },
            handler (context) {
                return graphql(this.graphQLSchema, context.params.query, this.resolvers, context, context.params.variables)
            }
        }
    },
    created () {
        this.graphQLSchema = makeExecutableSchema({ typeDefs: [this.settings.schema], resolvers }) // buildSchema(this.settings.schema)
        this.resolvers = resolvers
    },
    started () {
        this.broker.broadcast('graphqlService.connected', {
            typeName,
            schema,
            relations,
            relationDefinitions
        })
    },
    stopped () {
        this.broker.broadcast('graphqlService.disconnected', { typeName })
    }
})
