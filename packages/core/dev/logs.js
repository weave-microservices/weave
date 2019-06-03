const { Weave, TransportAdapters } = require('../lib')

const broker1 = Weave({
    nodeId: 'node-1',
    transport: TransportAdapters.Redis(),
    logger: {
        logLevel: 'info',
        stream: process.stdout,
        showModuleName: true,
        types: {
            // info: {
            //     badge: '🎅',
            //     label: 'santa',
            //     logLevel: 'info',
            //     color: 'white',
            //     done (data, ls) {
            //         // console.log(data)
            //     }
            // },
            rabbit: {
                badge: '🐰',
                label: 'rabbit',
                logLevel: 'info',
                color: 'red',
                done (data) {
                    // console.log(data)
                }
            }
        }
    },
    preferLocal: false
})

broker1.createService({
    name: 'test1',
    actions: {
        hello (context) {
            this.log.log('log message')
            this.log.info('info message')
            this.log.success('success message')
            this.log.debug('debug message')
            this.log.error('error message')
            this.log.fatal('fatal message')
            this.log.warn('warn message')
            this.log.wait('wait message')
            this.log.complete('complete message')
            this.log.note('note')
            this.log.star('star message')
            this.log.fav('fav message')
            this.log.rabbit('rabbit message')
        }
    }
})

Promise.all([
    broker1.start()
]).then(() => {
    broker1.log.info('-------------------------')
    broker1.call('test1.hello')
        .then(() => broker1.stop())
})
