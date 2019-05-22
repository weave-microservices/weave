const Strategies = {
    Random: require('./random'),
    RoundRobin: require('./round-robin')
}
const getByName = name => {
    if (!name) {
        return null
    }

    const n = Object.keys(Strategies).find(n => n.toLowerCase() === name.toLowerCase())
    if (n) {
        return this.Cache[n]
    }
}

module.exports = {
    resolve (option) {
        if (typeof option === 'string') {
            const stra = getByName(option)
        }
    }
}