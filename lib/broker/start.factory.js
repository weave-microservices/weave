const startFactory = ({ state, log, transport }) =>
    () => {
        return Promise.resolve()
            .then((values) => {
                if (transport) {
                    transport.connect()
                }
            })
            .then(() => Promise.all(state.services.map(service => service.started(service))))
            .catch(error => {
                log.error('Unable to start all services', error)
                clearInterval(state.waitForServiceInterval)
                return Promise.reject(error)
            })
            .then(() => {
                state.started = true
                log.info(`Weave service node with ${state.services.length} services is started successfully.`)
            })
    }

module.exports = startFactory
