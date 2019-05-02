const { Weave, TransportAdapters } = require('../lib')

const broker1 = Weave({
    nodeId: 'node-1',
    transport: TransportAdapters.Redis(),
    logger: {
        logLevel: 'warn',
        stream: process.stdout,
        showModuleName: true,
        types: {
            santa: {
                badge: '🎅',
                label: 'santa',
                logLevel: 'info',
                color: 'red'
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
            this.log.santa('santa message')
        }
    }
})

Promise.all([
    broker1.start()
]).then(() => {
    setInterval(() => {
        broker1.log.info('-------------------------')
        broker1.call('test1.hello')
    }, 1000)
})
