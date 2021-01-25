const { createBroker } = require('../dist')

const broker = createBroker({
  nodeId: '1'
})

broker.createService({
  name: 'testService',
  actions: {
    test () {
      return ''
    }
  },
  started () {
    setInterval(() => {
      this.actions.test()
    }, 5000)
  }
})

broker.start()

