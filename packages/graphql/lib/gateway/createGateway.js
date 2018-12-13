const { printSchema, graphql } = require('graphql')
const { mergeSchemas } = require('graphql-tools')
const createRemoteSchema = require('./createRemoteSchema')
const buildRelationalResolvers = require('./relations')

module.exports = (options) => ({
    name: 'gql-gateway',
    setings: {
        populateSchemaEvent: false
    },
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
            const { settings: { typeName, relationships, relationshipDefinitions }} = service
            if (!this.remoteSchemas[typeName]) {
                this.remoteSchemas[typeName] = await createRemoteSchema({
                    broker: this.broker,
                    service
                })
                if (relationships) {
                    this.relationships[typeName] = relationships
                    this.relationshipDefinitions[typeName] = relationshipDefinitions

                }
            }
        },
        generateSchema () {
            const schemas = Object.values(this.remoteSchemas).concat(Object.values(this.relationships))
            const resolvers = buildRelationalResolvers(this.relationshipDefinitions)
            this.graphQLSchema = mergeSchemas({
                schemas,
                resolvers
            })
            const schemaString = printSchema(this.graphQLSchema)
            if (this.settings.populateSchemaEvent) {
                this.broker.emit('$gql.new-schema', schemaString)
            }
        }
    },
    created () {
        this.discoveredTypes = []
        this.remoteSchemas = {}
        this.relationships = {}
        this.relationshipDefinitions = {}
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
