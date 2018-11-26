const { createGraphQLMixin } = require('../../lib/index')

const fakeDB = {
    Users: [
        {
            id: 1,
            name: 'Kevin',
            password: '0123123124'
        }
    ]
}

const schema = `
    type Query {
        users: [User]
        user(id: ID!): User
    }

    type User {
        id: ID
        name: String
        password: String
    }
`

const relations = `
    extend type User {
        organization: [Organization]
    }
`

const relationDefinitions = {
    books: {
        type: 'query', // Fetch via a 'query'
        operationName: 'booksByAuthor', // Use this query to resolve data
        args: {
            authorId: 'parent.id' // pass parent.id as authorId arg in the query
        }
    }
}

const resolvers = {
    Query: {
        users: () => fakeDB.Users,
        user: id => fakeDB.Users.find(user => user.id === id)
    }
}

module.exports = {
    name: 'user',
    mixins: createGraphQLMixin({
        typeName: 'User',
        schema,
        resolvers,
        relations,
        relationDefinitions
    })
}
