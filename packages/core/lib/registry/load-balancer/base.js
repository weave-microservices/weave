module.exports = (broker, registry) => {
    return {
        next (/*endpointList,context*/) {
            throw new Error('Method not implemented!')
        }
    }
}
