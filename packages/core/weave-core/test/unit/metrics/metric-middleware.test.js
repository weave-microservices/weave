const MetricMiddleware = require('../../../lib/middlewares/metrics')

const validMiddlewareHooks = [
  'serviceCreating',
  'serviceStarting',
  'serviceStarted',
  'serviceStopping',
  'serviceStopped',
  'serviceCreated',
  'created',
  'localAction',
  'remoteAction',
  'localEvent',
  'broadcast',
  'broadcastLocal',
  'emit'
]

describe('Test metric middleware', () => {
  it('should create a middleware', () => {
    const middleware = MetricMiddleware()
    const valid = Object.keys(middleware).every(p => validMiddlewareHooks.includes(p))
    expect(valid).toBe(true)
  })
})
