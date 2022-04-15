const { createBroker } = require('../../../packages/core/core/build/index')

const app = createBroker({
  nodeId: 'test'
});

app.start();
