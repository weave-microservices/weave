const getNextActionEndpointFactory = ({ registry }) =>
    (action, opts = {}) => {
        const endpointList = registry.getActionEndpoints(action, opts.nodeId)
        if (endpointList) {
            return endpointList.getNextAvailable()
        }
        return null
    }

module.exports = getNextActionEndpointFactory
