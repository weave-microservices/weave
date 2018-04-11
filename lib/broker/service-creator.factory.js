const serviceCreatorFactory = ({ state, makeNewService }) =>
    schema => {
        // add plugin
        const newService = makeNewService(schema)
        if (state.started) {
            newService.started(newService)
                .catch(error => state.log.error(`Unable to start service ${newService.name}: ${error}`))
        }
        return newService
    }

module.exports = serviceCreatorFactory
