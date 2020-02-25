const { Weave } = require('../../lib/index')

describe('Test internal service $node', () => {
  it('Five actions from "$node" should be available.', (done) => {
    const node1 = Weave({
      nodeId: 'node1',
      logger: {
        enabled: false
      }
    })

    node1.start().then(() => {
      node1.call('$node.actions', { withActions: true })
        .then(res => {
          expect(res.length).toBe(5)
          done()
        })
    })
  })

  it('shlould get one service from service node.', (done) => {
    const node1 = Weave({
      nodeId: 'node1',
      logger: {
        enabled: false
      }
    })

    node1.start().then(() => {
      node1.call('$node.services', { withNodeService: true })
        .then(res => {
          expect(res.length).toBe(1)
          done()
        })
    })
  })

  it('shlould get no event node service.', (done) => {
    const node1 = Weave({
      nodeId: 'node1',
      logger: {
        enabled: false
      }
    })

    node1.start().then(() => {
      node1.call('$node.events', { withNodeService: true })
        .then(res => {
          expect(res.length).toBe(0)
          done()
        })
    })
  })

  it('shlould get a list of all connected nodes', (done) => {
    const node1 = Weave({
      nodeId: 'node1',
      logger: {
        enabled: false
      }
    })

    node1.start().then(() => {
      node1.call('$node.list')
        .then(res => {
          expect(res.length).toBe(1)
          done()
        })
    })
  })

  it('shlould get a list of all connected nodes', (done) => {
    const node1 = Weave({
      nodeId: 'node1',
      logger: {
        enabled: false
      }
    })

    node1.start().then(() => {
      node1.call('$node.health')
        .then(result => {
          expect(result.client).toBeDefined()
          expect(result.cpu).toBeDefined()
          expect(result.memory).toBeDefined()
          expect(result.nodeId).toBeDefined()
          expect(result.process).toBeDefined()
          expect(result.os).toBeDefined()
          expect(result.transport).toBeNull()
          done()
        })
    })
  })
})
