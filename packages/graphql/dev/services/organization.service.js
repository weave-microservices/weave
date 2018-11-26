const { createGraphQLMixin } = require('../../lib/index')

const fakeDB = {
    Organizations: [
        {
            id: 1,
            name: 'Tesla',
            phone: '0123123124'
        }
    ]
}

const schema = `
    type Query {
        organizations: [Organization]
        organization(id: ID!): Organization
    }

    type Organization {
        id: ID
        name: String
        phone: String
    }
`

const resolvers = {
    Query: {
        organizations: () => fakeDB.Organizations,
        organization: id => fakeDB.Organizations.find(org => org.id === id)
    }
}

module.exports = {
    name: 'organization',
    mixins: createGraphQLMixin({
        typeName: 'Organization',
        schema,
        resolvers
    })
}
