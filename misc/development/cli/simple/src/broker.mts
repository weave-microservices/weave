import { createBroker } from "@weave-js/core";

const broker = createBroker({
    nodeId: 'node1'
})


broker.createService({
  name: 'test', 
  actions: {
    hello: {
      params: {
        name: 'string',
        age: { type: 'number' }
      },
      responseSchema: {
        type: 'string'
      },
      handler(context) {
        return context.data
      }
    }
  }
})


broker.createService({
  name: 'external',
  actions: {
    makeSomething: {
      // params: {
      //   email: { type: 'string' },
      // },
      handler(context) {
        return "require('./external/external-test').makeSomething()";
      }
    }
  }
})

await broker.start();

let result = await broker.call('test.hello', { name: 'kevin', age: 12 },  { meta: { retryCount: 2}});


const something = await broker.call("test.hello")

console.log(something)