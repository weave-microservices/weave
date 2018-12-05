module.exports = {
    name: 'math',
    actions: {
        add: {
            handler (context) {
                return 2342
            }
        },
        substract: {
            handler (context) {
                this.broker.log.info(context.params)
            }
        }
    },
    events: {
        '$services.changed' (service) {
            this.log.info(this.broker.services.map(service => service.name))
        }
    },
    started () {
        return new Promise(resolve => {
            setTimeout(() => {
                this.log.info('started')
                resolve()
            }, 2000)
        })
    },
    stopped () {
        return new Promise(resolve => {
            setTimeout(() => {
                this.log.info('stopped')
                return resolve('couldnt stop')
            }, 4000)
        })
    }
}
