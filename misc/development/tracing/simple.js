const { createBroker } = require('../../../packages/core/core/lib')
const repl = require('../../../packages/core/repl/lib/index')
const { createZipkinExporter } = require('../../../packages/tracing-adapters/zipkin/lib/index')

const app = createBroker({
  nodeId: 'trace',
  watchServices: true,
  tracing: {
    enabled: true,
    collectors: [
      createZipkinExporter()
    ],
    samplingRate: 1
  }
})

app.createService({
  name: 'test',
  actions: {
    hello: {
      // params: {
      //   name: 'string'
      // },
      async handler (context) {
        context.emit('hello.sent')
        return context.call('greater.hello')
      }
    }
  }
})

app.createService({
  name: 'greater',
  actions: {
    hello (context) {
      return 'text from test2'
    },
    async goodbye (context) {
      const span = await context.startSpan('do some fancy stuff')
      setTimeout(() => {
        await context.finishSpan(span)
      }, 2000)
      return 'nothing'
    },
    error (context) {
      throw new Error('hier ist was faul!!!!')
    }
  },
  events: {
    async 'hello.sent' (context) {
      await context.call('greater.goodbye')
      console.log('fired')
    }
  }
})

app.start()
  .then(() => repl(app))
