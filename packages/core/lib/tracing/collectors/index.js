const collectors = {
    Console: require('./console'),
    Event: require('./event'),
    Zipkin: require('./zipkin')
}

const getByName = name => {
    const n = Object.keys(collectors).find(collectorName => collectorName.toLowerCase() === name.toLowerCase())
    return collectors[n]
}

module.exports.resolveCollector = (collector, tracer) => {
    let CollectorClass
    if (typeof collector === 'string') {
        CollectorClass = getByName(collector)
    }
    if (!CollectorClass) {
        throw new Error('Tracer not found')
    }

    return new CollectorClass(collector)
}
