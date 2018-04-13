const { defaultsDeep } = require('lodash')

function RequestStatisticsStore (name, storeSize) {
    const self = Object.create(null)
    const timeBuckets = []

    let stat = null
    let lastTimeBucket = null

    self.count = 0

    self.add = (duration) => {
        self.count++
        if (duration !== null) {
            lastTimeBucket.times.push(duration)
        }
    }

    self.loop = () => {
        lastTimeBucket = {
            time: Date.now(),
            times: [],
            requestsPerSecond: null
        }
        timeBuckets.push(lastTimeBucket)
        if (timeBuckets.length > storeSize) {
            timeBuckets.shift()
        }
        calculate()
    }

    self.getSnapshot = () => {
        if (!stat) {
            stat = calculate()
        }
        return stat
    }

    self.loop()

    return self

    function calculate () {
        const stats = {
            count: self.count
        }
        const times = timeBuckets.reduce((a, b) => a.concat(b.times), [])
        if (times.length > 0) {
            times.sort((a, b) => a - b)
            stats.latency = {
                mean: times.reduce((a, b) => a + b, 0) / times.length
            }
        }
        stat = stats
        return stat
    }
}

function RequestStatistics (options) {
    const self = Object.create(null)
    const actions = new Map()

    options = defaultsDeep(options, {
        storeSize: 20,
        loopTime: 5000
    })
    const total = RequestStatisticsStore('total', options.storeSize)

    const loopTimer = setInterval(() => {
        runLoops()
    }, options.loopTime)

    loopTimer.unref()

    self.add = (actionName, duration) => {
        total.add(duration)
        if (!actions.has(actionName)) {
            actions.set(actionName, RequestStatisticsStore(actionName, options.storeSize))
        }
        actions.get(actionName).add(duration)
    }

    self.getSnapshot = () => {
        const result = {
            requests: {
                total: total.getSnapshot(),
                actions: {}
            }
        }
        actions.forEach((value, key) => {
            result.requests.actions[key] = value.getSnapshot()
        })
        return result
    }

    return self

    function runLoops () {
        total.loop()
        actions.forEach(item => item.loop())
    }
}

function Statistics ({ options }) {
    const self = Object.create(null)
    const requests = RequestStatistics(options)
    self.addRequest = (actionName, duration) => {
        requests.add(actionName, duration)
    }

    self.getSnapshot = () => {
        return requests.getSnapshot()
    }
    return self
}
module.exports = Statistics
