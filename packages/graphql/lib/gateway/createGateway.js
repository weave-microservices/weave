const { graphql } = require('graphql')
const { mergeSchemas } = require('graphql-tools')
const createRemoteSchema = require('./createRemoteSchema')

module.exports = (options) => ({
    name: 'gql-gateway',
    setings: {},
    actions: {
        graphql: {
            params: {
                query: { type: 'string' },
                variables: { type: 'object', optional: true }
            },
            handler (context) {
                return graphql(this.graphQLSchema, context.params.query, null, null, context.params.variables)
            }
        }
    },
    events: {
        '$services.changed': function (service) {
            this.handleServiceUpdate()
        },
        '$node.connected': function ({ node }) {
            return this.handleNodeConnection(node)
        }
    },
    methods: {
        async handleServiceUpdate (isLocalService) {
            const services = this.broker.registry.getServiceList({ withActions: true, withSettings: true })
                .filter(service => service.settings.hasGraphQLSchema === true)
                .filter(service => !this.discoveredTypes.includes(service.settings.typeName))
                // todo: blacklist
            if (services.length > 0) {
                for (const service of services) {
                    this.discoveredTypes[service.settings.typeName] = service.name
                    await this.buildRemoteSchema(service)
                }
            }
            this.generateSchema()
        },
        async handleNodeConnection (node) {
            const services = node.services
                .filter(service => service.settings.hasGraphQLSchema === true)
                .filter(service => !this.discoveredTypes.includes(service.settings.typeName))

            if (services.length > 0) {
                for (const service of services) {
                    this.discoveredTypes[service.settings.typeName] = service.name
                    await this.buildRemoteSchema(service)
                }
            }
            this.generateSchema()
        },
        handleNodeDisconnected () {
            console.log('')
        },
        async buildRemoteSchema (service) {
            const { settings: { typeName, relations, relationDefinitions }} = service
            if (!this.remoteSchemas[typeName]) {
                this.remoteSchemas[typeName] = await createRemoteSchema({
                    broker: this.broker,
                    service
                })
                if (relations) {
                    this.relationships[typeName] = relations
                }
            }
        },
        generateSchema () {
            const schemas = Object.values(this.remoteSchemas).concat(Object.values(this.relationships))
            this.graphQLSchema = mergeSchemas({
                schemas
            })
        }
    },
    created () {
        this.discoveredTypes = []
        this.remoteSchemas = {}
        this.relationships = {}
    },
    started () {
        // todo
        // wait for expected Types
        // return new Promise((resolve, reject) => {
        //     if (options.expectedTypes) {

        //     }
        // })
    }
})
