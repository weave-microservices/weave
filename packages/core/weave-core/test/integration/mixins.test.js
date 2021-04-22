const { Weave } = require('../../lib/index')
const ServiceHookMixin = require('./mixins/service-hook.mixin')
const hasServiceScope = require('./scope-checks/service.scope')
const nested1 = require('./mixins/nested1.mixin')

describe('Service lifetime hooks within mixins', () => {
  it('should call lifecycle hook "created" with correct scope if there are nested hooks from a mixin.', done => {
    const node1 = Weave({
      nodeId: 'node1',
      logger: {
        enabled: false
      }
    })

    node1.createService({
      name: 'testService',
      mixins: [ServiceHookMixin()],
      created () {
        hasServiceScope(this, done)
        done()
      }
    })
    node1.start().then(() => node1.stop())
  })

  it('should call lifecycle hook "started" with correct scope if there are nested hooks from a mixin.', done => {
    const node1 = Weave({
      nodeId: 'node1',
      logger: {
        enabled: true
      }
    })

    node1.createService({
      name: 'testService',
      mixins: [ServiceHookMixin()],
      started () {
        hasServiceScope(this, done)
        done()
      }
    })
    node1.start().then(() => node1.stop())
  })

  it('should call lifecycle hook "stopped" with correct scope if there are nested hooks from a mixin.', done => {
    const node1 = Weave({
      nodeId: 'node1',
      logger: {
        enabled: false
      }
    })

    node1.createService({
      name: 'testService',
      mixins: [ServiceHookMixin()],
      stopped () {
        hasServiceScope(this, done)
        done()
      }
    })
    node1.start().then(() => node1.stop())
  })
})

describe('Service lifetime hooks error handling', () => {
  it('should throw a error from a mixed started hook.', async () => {
    const node1 = Weave({
      nodeId: 'node1',
      logger: {
        enabled: false
      }
    })

    node1.createService({
      name: 'testService',
      mixins: [ServiceHookMixin('started')],
      started () {
        // return Promise.reject(new Error('sss'))
      }
    })

    await expect(node1.start()).rejects.toThrow('Rejected hook from started')
  })

  it('should throw a error from a mixed stopped hook.', async () => {
    const node1 = Weave({
      nodeId: 'node1',
      logger: {
        enabled: false
      }
    })

    node1.createService({
      name: 'testService',
      mixins: [ServiceHookMixin('stopped')],
      stopped () {
        // return Promise.reject(new Error('sss'))
      }
    })

    await expect(node1.start()
      .then(() => node1.stop())
    ).rejects.toThrow('Rejected hook from stopped')
  })

  it('should mix in nested mixins.', async () => {
    const node1 = Weave({
      nodeId: 'node1',
      logger: {
        enabled: false
      }
    })

    const service = node1.createService({
      name: 'testService',
      mixins: [nested1()],
      stopped () {
        // return Promise.reject(new Error('sss'))
      }
    })

    expect(service.actions.a).toBeDefined()
    expect(service.actions.b).toBeDefined()
    expect(service.actions.c).toBeDefined()
    expect(service.actions.d).not.toBeDefined()
  })
})
