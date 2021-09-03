const { createBroker } = require("../../../packages/core/core/lib")

const broker = createBroker()

broker.log.info({ name: 'Kevin' })
broker.log.error(new Error('asdassds'))

broker.start()
