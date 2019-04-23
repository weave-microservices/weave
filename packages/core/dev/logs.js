const { Weave, TransportAdapters } = require('../lib')
const fs = require('fs')

const stream = fs.createWriteStream('./logs.txt')

const broker1 = Weave({
    nodeId: 'node-1',
    transport: TransportAdapters.Redis(),
    // logger: console,
    logLevel: 'info',
    logger: {
        stream: [stream, process.stdout],
        types: {
            error: {
                done (arr) {
                    console.log(arr)
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
            this.log.info(context.level)
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

            context.emit('testes')
            this.broker.getLogger('sadasd')
        
            return context.call('$node.actions')
        }
    },
    events: {
        testes () {
        }
    }
})

Promise.all([
    broker1.start()
]).then(() => {
    setInterval(() => {
        broker1.log.info('-------------------------')
        broker1.call('test1.hello')
            .then(result => {
                
            })
    }, 1000)
})
