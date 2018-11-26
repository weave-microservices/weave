const { ApolloLink, Observable } = require('apollo-link')
const { print } = require('graphql/language/printer')

function createWeaveLink (options) {
    return new ApolloLink(
        operation =>
            new Observable(observer => {
                const { credentials, fetcherOptions } = operation.getContext() // needed?
                const { operationName, extensions, variables, query } = operation // needed?
                const { broker, service } = options

                broker.call(`${service.name}.graphql`, {
                    query: print(query),
                    variables,
                    operationName,
                    extensions,
                    credentials,
                    fetcherOptions
                })
                    .then(result => {
                        observer.next(result)
                        observer.complete()
                    })
                    .catch(observer.error.bind(observer))
            }))
}

module.exports = class WeaveLink extends ApolloLink {
    constructor (options) {
        super()
        this.requester = createWeaveLink(options).request
    }

    request (op) {
        return this.requester(op)
    }
}
