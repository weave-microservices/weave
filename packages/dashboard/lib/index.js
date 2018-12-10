const WebGateway = require('@weave-js/web')
const io = require('socket.io')
const path = require('path')
const crypto = require('crypto')

module.exports = () => ({
    name: 'weave-dashboard',
    mixins: [WebGateway()],
    settings: {
        port: 4445,
        assets: {
            folder: path.join(__dirname, '..', 'dist')
        },
        routes: [
            {
                path: '/api',
                aliases: {
                    'GET /nodes': 'weave-dashboard.getNodes',
                    'GET /services': 'weave-dashboard.getServices',
                    'GET /vehicles': 'vehicle.list'
                }
            }
        ]
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
                    }
                )
            }
        },
        getServices: {
            handler () {
                return this.broker.registry.getActionList({
                    withEndpoints: true
                })
            }
        }
    },
    events: {
        '**' (data, sender, event) {
            console.log(event)
            // if (event === '$services.changed' || event === '$node.connected' || event === '$node.disconnected') {
                
            // }
            this.socketio.emit(event, {
                sender,
                data
            })
        },
    },
    methods: {

    },
    created () {
        this.accessToken = Math.random().toString(36).substring(2)
    },
    started () {
        this.socketio = io(this.server)

        // Register a call event for every websocket client to call actions.
        this.socketio.on('connection', client => {
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