const { Weave } = require('../../lib')

const app = Weave({
    nodeId: 'trace',
    watchServices: true,
    tracing: {
        enabled: true,
        samplingRate: 1
    }
})

app.createService({
    name: 'test',
    actions: {
        hello (context) {
            return context.call('test2.hello')
        }
    },
    events: {
        '$tracing.trace.span.started' (data) {
            console.log('fired')
        },
        '$tracing.trace.span.finished' () {
            console.log('finished')
        }
    }
})

app.createService({
    name: 'test2',
    actions: {
        hello (context) {
            return 'text from test2'
        }
    },
    events: {
        '$tracing.trace.span.started' (data) {
            console.log('fired')
        },
        '$tracing.trace.span.finished' (data) {
            console.log('finished')
        }
    }
})

app.start()
    .then(() => {
        app.call('test.hello')
            .then(res => app.log.info('called'))
    })
