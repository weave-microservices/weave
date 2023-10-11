const { createBroker } = require('../../packages/core/core/lib');
const repl = require('../../packages/core/repl/lib/index');
const { createZipkinExporter } = require('../../packages/tracing-adapters/zipkin/lib/index');

const app = createBroker({
  nodeId: 'trace',
  logger: {
    enabled: true
  },
  // cache: {
  //   enabled: false,
  //   adapter: createInMemoryCache()
  // },
  tracing: {
    enabled: true,
    collectors: [
      createZipkinExporter()
    ],
    defaultTags: {
      environment: 'development'
    },
    samplingRate: 1,
    actions: {
      meta: true,
      tags: {
        'default-action-tag': 'default-action-tag-value'
      }
    }
  }
});

app.createService({
  name: 'test',
  actions: {
    hello: {
      tracing: {
        spanName: 'Keven'
      },
      async handler (context) {
        const span1 = context.startSpan('do some fancy stuff');
        await new Promise((resolve) => {
          setTimeout(async () => {
            resolve();
          }, 20);
        });

        await context.call('greater.hello');
        context.finishSpan(span1);

        context.emit('hello.sent');
        return false;
      }
    },
    withData: {
      params: {
        name: 'string'
      },
      tracing: {
        tags: {
          response: true
        }
      },
      async handler (context) {
        console.log(context.data.name);
        return context.data.name;
      }
    },
    withDataNestedResponse: {
      params: {
        name: 'string'
      },
      tracing: {
        tags: {
          response: ['timestamps', 'name', 'user._id'],
          meta: true
        }
      },
      async handler (context) {
        console.log(context.data.name);
        return {
          name: context.data.name,
          timestamp: Date.now()
        };
      }
    }
  }
});

app.createService({
  name: 'greater',
  actions: {
    hello: {
      tracing: {
        tags: {
          response: true
        }
      },
      handler (context) {
        return 'text from test2';
      }
    },
    goodbye: {
      cache: {
        ttl: 10000
      },
      async handler (context) {
        // const span = await context.startSpan('do some fancy stuff')
        return new Promise((resolve) => {
          setTimeout(async () => {
            // await context.finishSpan(span)
            resolve('nothing');
          }, 2000);
        });
      }
    },
    error (context) {
      throw new Error('hier ist was faul!!!!');
    }
  },
  events: {
    async 'hello.sent' (context) {
      await context.call('greater.goodbye');

      const span2 = context.startSpan('calling here API', {
        tags: {
          query: 'Las Vegas'
        }
      });
      await new Promise((resolve) => {
        setTimeout(async () => {
          resolve();
        }, 3000);
      });
      context.finishSpan(span2);

      await this.actions.hello({}, { parentContext: context });
    }
  }
});

app.start()
  .then(() => repl(app));

