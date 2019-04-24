module.exports = (broker, options) => {
    const log = broker.createLogger('metrics')

    return {
        init () {
            log.debug('Metrics initialized.')
        },
        register () {

        },
        increment () {

        }
    }
}
