module.exports = {
    name: 'math',
    actions: {
        add: {
            handler (context) {
                console.log('ich laufe jetzt we')
                return 2342
            }
        },
        substract: {
            handler (context) {
                console.log(context.params)
            }
        }
    },
    events: {
        '$services.changed' (service) {
            console.log(this.broker.services.map(service => service.name))
        }
    },
    started () {
        console.log('started')
        setInterval(() => {}, 2000)
    },
    stopped () {
        console.log('stopped')
        return new Promise((resolve) => {
            setTimeout(() => {
                return resolve('couldnt stop')
            }, 4000)
        })
    }
}
