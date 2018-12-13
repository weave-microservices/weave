const { createGraphQLMixin } = require('../../lib/index')

const fakeDB = {
    Users: [
        {
            id: 1,
            name: 'Kevin',
            password: '0123123124',
            orgId: 1
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
        password: String,
        orgId: Int
    }
`

const relationships = `
    extend type User {
        organization: Organization,
        organizations: [Organization]
    }
`

const relationshipDefinitions = {
    organization: {
        type: 'query', // Fetch via a 'query'
        operationName: 'getOrganization', // Use this query to resolve data
        args: {
            id: 'parent.orgId' // pass parent.id as authorId arg in the query
        }
    },
    organizations: {
        type: 'query', // Fetch via a 'query'
        operationName: 'getOrganizations' // Use this query to resolve dat
    }
}

const resolvers = {
    Query: {
        users: () => {
            return fakeDB.Users
        },
        user: id => fakeDB.Users.find(user => user.id === id)
    }
}

module.exports = {
    name: 'user',
    dependencies: 'organization',
    mixins: createGraphQLMixin({
        typeName: 'User',
        schema,
        resolvers,
        relationships,
        relationshipDefinitions
    })
}
