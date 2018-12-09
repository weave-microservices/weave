const WebGateway = require('@weave-js/web')
// const socketio = require('socker.io')
const path = require('path')
const crypto = require('crypto')

module.exports = () => ({
    name: 'weave-dashboard',
    mixins: [WebGateway()],
    stettings: {
        port: 4445,
        assets: {
            folder: path.join('..', 'public')
        }
    },
    created () {
    },
    started () {

    }
})