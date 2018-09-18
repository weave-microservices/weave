module.exports = class MemoryStore {
    constructor (windowSizeMs) {
        this.counters = new Map()
        this.resetTime = Date.now() + windowSizeMs

        setInterval(() => {
            this.resetTime = Date.now() + windowSizeMs
            this.reset()
        }, windowSizeMs)
    }

    increment (key) {
        let counter = this.counters.get(key) || 0
        counter++
        this.counters.set(key, counter)
        return counter
    }

    reset () {
        this.counters.clear()
    }
}
