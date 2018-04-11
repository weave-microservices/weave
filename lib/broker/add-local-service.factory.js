const addLocalServiceFactory = ({ state, registry }) =>
    (service, registryItem) => {
        state.services.push(service)
        registry.registerLocalService(registryItem)
    }

module.exports = addLocalServiceFactory
