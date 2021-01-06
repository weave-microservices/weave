// const { omit } = require('@weave-js/utils')
const { TracingAdapters } = require('../../../lib/index')
const { createNode } = require('../../helper')
const { posts, users } = require('../../helper/data')

// const pickSpanFields = (spans, fieldsToOmit = []) => {
//   return spans.map(span => {
//     span = omit(span, ['startTime', 'duration', 'finishTime'])
//     return span
//   })
// }

describe('Test tracing', () => {
  let flow = []
  let id = 0
  const defaultSettings = {
    logger: {
      enabled: false
      // logLevel: 'fatal'
    },
    transport: {
      adapter: 'dummy'
    },
    tracing: {
      enabled: true,
      collectors: [
        TracingAdapters.Event({
          interval: 0
        })
      ]
    },
    uuidFactory (broker) {
      return `${broker.nodeId}-${++id}`
    }
  }

  const node1 = createNode(Object.assign({ nodeId: 'node1' }, defaultSettings), [{
    name: 'tracing-collector',
    events: {
      '$tracing.trace.spans' (ctx) {
        flow.push(...ctx.data)
      }
    }
  }])

  const node2 = createNode(Object.assign({ nodeId: 'node2' }, defaultSettings), [{
    name: 'post',
    actions: {
      list (context) {
        const $posts = Array.from(posts)
        return Promise.all($posts.map(async post => {
          post.author = await context.call('user.get', { id: post.author })
          return post
        }))
      }
    }
  }])

  const node3 = createNode(Object.assign({ nodeId: 'node3' }, defaultSettings), [{
    name: 'user',
    actions: {
      get (context) {
        const user = users.find(user => user.id === context.data.id)
        return user
      }
    }
  }])

  const node4 = createNode(Object.assign({ nodeId: 'node4' }, defaultSettings), [{
    name: 'friends'
  }])
  // const node1 = Weave({
  //   nodeId: 'node1',
  //   logger: {
  //     enabled: false,
  //     logLevel: 'fatal'
  //   },
  //   transport: {
  //     adapter: TransportAdapters.Dummy()
  //   },
  //   tracing: {
  //     enabled: true,
  //     collectors: [
  //       TracingAdapters.Event({
  //         interval: 0
  //       })
  //     ]
  //   }
  // })

  // const node2 = Weave({
  //   nodeId: 'node2',
  //   logger: {
  //     enabled: false,
  //     logLevel: 'fatal'
  //   },
  //   transport: {
  //     adapter: TransportAdapters.Dummy()
  //   },
  //   tracing: {
  //     enabled: true,
  //     collectors: [
  //       TracingAdapters.Event({
  //         interval: 0
  //       })
  //     ]
  //   }
  // })

  node2.createService({
    name: 'test',
    actions: {
      hello (context) {
        return 'Hello'
      }
    }
  })

  beforeAll(() => Promise.all([
    node1.start(),
    node2.start(),
    node3.start(),
    node4.start()
  ]))

  afterAll(() => Promise.all([
    node1.stop(),
    node2.stop(),
    node3.stop(),
    node4.stop()
  ]))

  afterEach(() => {
    flow = []
    id = 0
  })

  it('Started and finished event should be triggered.', async () => {
    await node1.waitForServices(['post', 'user', 'friends'])
    const result = await node2.call('post.list')
    expect(result).toMatchSnapshot()

    flow.sort((a, b) => a.startTime - b.startTime)

    // const spans = pickSpanFields(flow)

    // expect(spans.length).toBe(39)
  })

  // it('Started event should be the expected format.', () => {
  //   return node1.call('test.hello')
  //     .then(() => {
  //       const startedEvent = flow[0]

  //       // expect(startedEvent.id).toBeDefined()
  //       expect(startedEvent.id).toBeDefined()
  //       expect(startedEvent.name).toBe('action \'test.hello\'')
  //       expect(startedEvent.tags).toBeDefined()
  //       expect(startedEvent.tags.nodeId).toBe('node2')
  //       // expect(startedEvent.callerNodeId).toBe('node1')
  //       expect(startedEvent.tags.remoteCall).toBe(true)
  //       // expect(startedEvent.nodeId).toBe('node2')
  //       expect(startedEvent.startTime).toBeDefined()
  //       // expect(startedEvent.callerNodeId).toBe('node1')
  //     })
  // })

  // it('Finished event should be the expected format.', () => {
  //   return node1.call('test.hello')
  //     .then(res => {
  //       const startedEvent = flow[1]

  //       expect(startedEvent.id).toBeDefined()
  //       expect(startedEvent.name).toBe('action \'test.hello\'')
  //       expect(startedEvent.tags).toBeDefined()
  //       expect(startedEvent.tags.nodeId).toBe('node2')
  //       // expect(startedEvent.callerNodeId).toBe('node1')
  //       expect(startedEvent.startTime).toBeDefined()
  //       expect(startedEvent.finishTime).toBeDefined()
  //       expect(startedEvent.duration).toBeDefined()

  //       expect(startedEvent.tags.remoteCall).toBe(true)

  //       // expect(startedEvent.id).toBeDefined()
  //       // expect(startedEvent.requestId).toBeDefined()
  //       // expect(startedEvent.callerNodeId).toBe('node1')
  //       // expect(startedEvent.isRemoteCall).toBe(true)
  //       // expect(startedEvent.nodeId).toBe('node2')
  //       // expect(startedEvent.startTime).toBeDefined()
  //       // expect(startedEvent.callerNodeId).toBe('node1')
  //       // expect(startedEvent.stopTime).toBeDefined()
  //       // expect(startedEvent.isCachedResult).toBeDefined()
  //       // expect(startedEvent.isCachedResult).toBe(false)
  //       // expect(startedEvent.stopTime).toBeGreaterThan(startedEvent.startTime)
  //     })
  // })
})
