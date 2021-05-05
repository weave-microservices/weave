const MetricMiddleware = require('../../../lib/middlewares/metrics')
const { middlewareHooks } = require('../../helper/constants')

describe('Test metric middleware', () => {
  it('should create a middleware', () => {
    const fakeRuntime = {
      metrics: {},
      options: {
        metrics: {
          enabled: true
        }
      }
    }

    const middleware = MetricMiddleware(fakeRuntime)
    const valid = Object.keys(middleware).every(p => middlewareHooks.includes(p))
    expect(valid).toBe(true)
  })
})
