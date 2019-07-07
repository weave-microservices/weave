const { ApolloServerBase } = require('apollo-server-core')
const { renderPlaygroundPage } = require('@apollographql/graphql-playground-html')

const createGraphqlHandler = require('./graphql-handler')

const send = (request, response, statusCode, data, responseType) => {
    // context, route, request, response, action, data
    const context = request.$context
    const service = request.$service

    if (responseType) {
        context.meta.$responseType = responseType
    }
    response.statusCode = 200
    return service.sendResponse(context, null, request, response, null, data)
}

class WeaveApolloServer extends ApolloServerBase {
    createGraphQLServerOptions (req, res) {
        return super.graphQLServerOptions({ req, res })
    }

    createHandler ({ path, disableHealthCheck, onHealthCheck } = {}) {
        return async (request, response) => {
            this.graphqlPath = path || '/graphql'
            if (this.playgroundOptions && request.method === 'GET') {
                const middlewareOptions = {
                    endpoint: this.graphqlPath
                }
                return send(request, response, 200, renderPlaygroundPage(middlewareOptions), 'text/html')
            }

            const graphqlHandler = createGraphqlHandler(() => this.createGraphQLServerOptions(request, response))
            const result = await graphqlHandler(request, response)
            return send(request, response, 200, result, 'application/json; charset=utf-8;')
            // handle graphql
        }
    }
}

module.exports = WeaveApolloServer
