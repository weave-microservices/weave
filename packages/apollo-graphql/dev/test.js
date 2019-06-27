const { Weave } = require('@weave-js/core')
const WebMixin = require('@weave-js/web')
const ApolloService = require('../lib/apollo-service')

const broker1 = Weave({
    nodeId: 'api',
    transport: {
        adapter: 'fake'
    }
    // transport: {
    //     adapter: 'fake'
    // }
})

const broker2 = Weave({
    nodeId: 'services',
    transport: {
        adapter: 'fake'
    }
    // transport: {
    //     adapter: 'fake'
    // }
})

broker1.createService({
    name: 'api',
    mixins: [
        WebMixin(),
        ApolloService()
    ],
    settings: {
        port: 3001,
        routes: [
            {
                path: '/test',
                aliases: {
                    '/foo': '$node.services'
                }
            }
        ]
    }
})

broker2.createService({
    name: 'users',
    settings: {
        graphql: {
            type: `
                type User{
                    id: Int!
                    name: String!
                }
            `
        }
    },
    actions: {
        getUsers: {
            params: {
                limit: { type: Number, optonal: true }
            },
            graphql: {
                query: `users (limit: Int): [User]`
            },
            handler (context) {
                return context.params.limit + ' user'
            }
        }
    }
})

broker1.start()
broker2.start()
