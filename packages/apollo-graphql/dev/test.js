const { Weave } = require('@weave-js/core')
const WebMixin = require('@weave-js/web')
const ApolloService = require('../lib/weave-apollo-service')

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
        ApolloService({
            serverOptions: {
                playground: false
            }
        })
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

                type completeRegistrationPayload {
                    id: String
                }
            `
        }
    },
    actions: {
        find: {
            params: {
                id: { type: Number }
            },
            graphql: {
                query: `user (id: Int): User`
            },
            handler (context) {
                return this.users.find(user => user.id === context.params.id)
            }
        },
        getUsers: {
            params: {
                limit: { type: Number, optonal: true }
            },
            graphql: {
                query: `users (limit: Int): [User]`
            },
            handler (context) {
                return this.users
            }
        },
        createUser: {
            params: {
                name: { type: String }
            },
            graphql: {
                mutation: `createUser (name: String): User`
            },
            handler (context) {
                const user = {
                    id: this.users.length + 1,
                    name: context.params.name
                }
                this.users.push(user)

                return user
            }
        },
        completeRegistration: {
            params: {
                name: { type: String }
            },
            graphql: {
                mutation: `
                    completeRegistration(
                        userId: ID!
                        password: String!
                        inviteId: String!
                    ): completeRegistrationPayload!`
            },
            handler (context) {
                const user = {
                    id: this.users.length + 1,
                    name: context.params.name
                }
                this.users.push(user)

                return user
            }
        }
    },
    created () {
        this.users = [{
            'id': 1,
            name: 'Kevin'
        }]
    }
})

broker2.createService({
    name: 'posts',
    settings: {
        graphql: {
            type: `
                type Post{
                    id: Int!
                    text: String!
                    author: User!
                }
            `,
            resolvers: {
                Post: {
                    author: {
                        action: 'users.find',
                        rootParams: {
                            author: 'id'
                        }
                    }

                }
            }
        }
    },
    actions: {
        getPosts: {
            params: {
                limit: { type: Number, optonal: true }
            },
            graphql: {
                query: `posts (limit: Int): [Post]`
            },
            handler (context) {
                return this.posts
            }
        }
    },
    created () {
        this.posts = [
            {
                id: 1,
                text: 'Hello World',
                author: 1
            }
        ]
    }
})

broker1.start()
broker2.start()
