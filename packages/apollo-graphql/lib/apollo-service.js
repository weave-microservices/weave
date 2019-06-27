const { existsSync } = require('fs')
const { join } = require('path')

module.exports = (mixinOptions) => {
    mixinOptions = Object.assign({
        routeOptions: {
            path: '/graphql'
        }
    }, mixinOptions)

    const mixinSchema = {
        name: 'graphql',
        settings: {
            transport: null,
            from: null
        },
        events: {
            '$services.changed' () {
                this.invalidateGraphQLSchema()
            }
        },
        actions: {
            send: {
                params: {
                    message: { type: 'object' },
                    data: { type: 'object', optional: true }
                },
                handler (context) {
                    const { message } = context.params
                    // if (message.template) {
                    //     if (this.templateFileNotExists(message.template)) {
                    //         return Promise.reject(new WeaveError(`Email template is missing: ${message.template}`))
                    //     }
                    // }
                    return this.send(message)
                }
            }
        },
        methods: {
            prepareGraphQLSchema () {
                const services = this.broker.registry.services.list({ withActions: true })

                services.map(service => {
                    console.log(service)
                })
            },
            invalidateGraphQLSchema () {
                
            },
            generateGraphQLSchema (services) {

            },
            graphqlHandler (request, response) {
                return response.end('Sss')
            }
        },
        created () {
            const graphqlRoute = Object.assign({
                aliases: {
                    '/' (request, response) {
                        try {
                            this.prepareGraphQLSchema()
                            return this.graphqlHandler(request, response)
                        } catch (error) {
                            this.sendError(request, response, error)
                        }
                    }
                },
                mappingPolicy: 'restrict',
                bodyParsers: {
                    json: true,
                    urlencoded: { extended: true }
                }
            }, mixinOptions.routeOptions)

            this.settings.routes.unshift(graphqlRoute)
        }
    }

    return mixinSchema
}
