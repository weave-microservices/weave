const types = {
    Counter: require('./counter'),
    Gauge: require('./gauge')

}

const getByName = name => {
    const n = Object.keys(types).find(i => i.toLocaleLowerCase() === name.toLocaleLowerCase())
    if (n) {
        return types[n]
    }
}

module.exports = {
    resolve (type) {
        return getByName(type)
    }
}
