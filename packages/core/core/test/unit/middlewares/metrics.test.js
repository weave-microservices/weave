// const utils = require('../../../lib/utils')

const Middleware = require('../../../lib/middlewares/metrics')
const { createNode } = require('../../helper')
// const Context = require('../../../lib/broker/context')

const config = {
  logger: {
    enabled: false,
    level: 'fatal'
  },
  metrics: {
    enabled: true
  }
}
// const SlowService = require('../../services/slow.service')

describe('Test metrics middleware', () => {
  const broker = createNode(config)
  // const contentFactory = createContextFactory()
  // const handler = jest.fn(() => Promise.resolve('hooray!!!'))
  const middleware = Middleware(broker.runtime)

  // const endpoint = {
  //   action,
  //   node: {
  //     id: broker.nodeId
  //   }
  // }

  it('should register hooks', () => {
    expect(middleware.localAction).toBeDefined()
  })
})
