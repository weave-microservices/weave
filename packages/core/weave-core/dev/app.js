const { Weave } = require('../dist')

const broker = Weave({
  nodeId: '1'
})


broker.start()

