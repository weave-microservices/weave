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
    type Organization {
        id: ID
        name: String
        phone: String
    }

    type Query {
        getOrganizations: [Organization]
        getOrganization: Organization
    }
`

const resolvers = {
    Query: {
        getOrganizations: () => {
            return fakeDB.Organizations
        },
        getOrganization: (sss, param) => {
            const id = 1
            return fakeDB.Organizations.find(org => org.id === id)
        }
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
