module.exports = {
    name: 'formater',
    actions: {},
    events: {},
    created () {
        this.log.info(this.name + ' created')
    },
    started () {
        return new Promise(resolve => {
            setTimeout(() => {
                this.log.info(this.name + ' started')
                resolve()
            }, 2000)
        })
    },
    stopped () {
        return new Promise(resolve => {
            setTimeout(() => {
                this.log.info(this.name + ' stopped gracefully')
                return resolve()
            }, 2000)
        })
    }
}
