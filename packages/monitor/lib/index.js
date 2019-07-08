
// node modules
const WebGateway = require('@weave-js/web')
const io = require('socket.io')
const path = require('path')

module.exports = () => ({
    name: 'wlm',
    mixins: [WebGateway()],
    settings: {
        port: 4445,
        assets: {
            folder: path.join(__dirname, '..', 'dist')
        },
        mappingPolicy: 'restricted'
    },
    actions: {
        getNodes: {
            handler () {
                return this.broker.registry.nodes.list({ withServices: true })
                    .map(node => {
                        return {
                            id: node.id,
                            isLocal: node.isLocal,
                            isAvailable: node.isAvailable,
                            offlineTime: node.offlineTime,
                            serviceCount: node.services.length
                        }
                    })
            }
        },
        getServices: {
            handler () {
                return this.broker.registry.services.list({
                    withActions: true,
                    withEvents: true
                })
            }
        },
        getActions: {
            handler () {
                return this.broker.registry.actions.list({
                    withEndpoints: true
                })
            }
        },
        getEvents: {
            handler () {
                return this.broker.registry.events.list({
                    withEndpoints: true
                })
            }
        }
    },
    events: {
        // proxy all events to the client
        '**' (data, sender, event) {
            console.log(event)
            this.socketio.emit(event, {
                sender,
                data
            })
        }
    },
    created () {
        this.accessToken = Math.random().toString(36).substring(2)
    },
    started () {
        this.socketio = io(this.server)
        this.socketList = []
        // Register a call event for every websocket client to call actions.
        this.socketio.on('connection', client => {
            this.socketList.push(client)
            client.on('call', ({ actionName, parameters, options }, done) => {
                this.broker.call(actionName, parameters, options)
                    .then(result => {
                        if (done) {
                            done(null, result)
                        }
                    })
                    .catch(error => done(error, null))
            })
        })

        this.log.info(`Access token for the dashboard: ${this.accessToken}`)
    }
})
