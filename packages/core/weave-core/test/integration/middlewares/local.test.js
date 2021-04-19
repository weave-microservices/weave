const { Weave } = require('../../../lib/index')

const createMiddlewareWithFlow = (flowArray) => {
  return {
    created (broker) {
      flowArray.push('created')
    },
    starting (broker) {
      flowArray.push('starting')
    },
    started (broker) {
      flowArray.push('started')
    },
    serviceStarting (service, schema) {
      flowArray.push('serviceStarting:' + service.name)
    },
    serviceStarted (service, schema) {
      flowArray.push('serviceStarted:' + service.name)
    },
    serviceStopping (service, schema) {
      flowArray.push('serviceStopping:' + service.name)
    },
    serviceStopped (service, schema) {
      flowArray.push('serviceStopped')
    },
    localAction (next, action) {
      flowArray.push('localAction:' + action.name)
    },
    remoteAction (next, action) {
      flowArray.push('remoteAction')
    },
    emit (next) {
      flowArray.push('emit')
      return function () {
        return next(...arguments)
      }
    },
    broadcast (next) {
      flowArray.push('broadcast')
      return function () {
        return next(...arguments)
      }
    },
    broadcastLocal (next) {
      flowArray.push('broadcastLocal')
      return function () {
        return next(...arguments)
      }
    },
    call (next) {
      flowArray.push('call')
      return function () {
        return next(...arguments)
      }
    },
    multiCall (next) {
      flowArray.push('multiCall')
      return function () {
        return next(...arguments)
      }
    },
    createService (next) {
      flowArray.push('createService')
      return function () {
        return next(...arguments)
      }
    },
    loadService (next) {
      flowArray.push('loadService')
      return function () {
        return next(...arguments)
      }
    },
    loadServices (next) {
      flowArray.push('loadServices')
      return function () {
        return next(...arguments)
      }
    }
  }
}

describe('Test middlewares', () => {
  it('should fire middleware hooks in always the same order', async () => {
    const flow = []
    const broker = Weave({
      middlewares: [createMiddlewareWithFlow(flow)]
    })

    await broker.start()
    expect(flow.join('-')).toBe('call-multiCall-emit-broadcast-broadcastLocal-createService-loadService-loadServices-localAction:$node.services-localAction:$node.actions-localAction:$node.events-localAction:$node.health-localAction:$node.list-created-starting-serviceStarting:$node-localAction:$node.services-localAction:$node.actions-localAction:$node.events-localAction:$node.health-localAction:$node.list-serviceStarted:$node-started')
  })

  it('should decorate broker instance', async () => {
    const broker = Weave({
      nodeId: 'node1',
      logger: {
        enabled: false
      },
      middlewares: [{
        created (runtime) {
          runtime.getNodeId = () => {
            return `The node ID is "${runtime.nodeId}"`
          }
        }
      }]
    })

    broker.createService({
      name: 'testService',
      actions: {
        getId () {
          return this.runtime.getNodeId()
        }
      }
    })

    await broker.start()
    const result = await broker.call('testService.getId')
    expect(result).toBe('The node ID is "node1"')
  })
})
