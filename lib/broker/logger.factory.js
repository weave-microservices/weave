const Logger = require('../logger')

const loggerFactory = ({ state, options }) =>
    (logName, service, version) => {
        const bindings = {
            nodeId: state.nodeId
        }

        if (service) {
            bindings.service = service
            if (version) {
                bindings.version = version
            }
        } else {
            bindings.logName = logName
        }

        return Logger.createDefaultLogger(options.logger, bindings, options.logLevel)
    }

module.exports = loggerFactory
