const { Weave, TransportAdapters } = require('../../lib/index')

describe('Test tracing', () => {
    let flow = []

    const node1 = Weave({
        nodeId: 'node1',
        logger: {
            logLevel: 'fatal'
        },
        transport: {
            adapter: TransportAdapters.Fake()
        },
        tracing: {
            enabled: true
        }
    })

    const node2 = Weave({
        nodeId: 'node2',
        logger: {
            logLevel: 'fatal'
        },
        transport: {
            adapter: TransportAdapters.Fake()
        },
        tracing: {
            enabled: true
        }
    })

    node2.createService({
        name: 'test',
        actions: {
            hello (context) {
                return 'Hello'
            }
        },
        events: {
            '$tracing.trace.span.started' (res) {
                flow.push(res)
            },
            '$tracing.trace.span.finished' (res) {
                flow.push(res)
            }
        }
    })

    beforeAll(() => {
        return node1.start()
            .then(() => node2.start())
    })

    afterAll(() => {
        return node1.stop()
            .then(() => node2.stop())
    })

    afterEach(() => {
        flow = []
    })

    it('Started and finished event should be triggered.', (done) => {
        return node1.call('test.hello')
            .then(res => {
                expect(flow.length).toBe(2)
                done()
            })
    })

    it('Started event should be the expected format.', () => {
        return node1.call('test.hello')
            .then(() => {
                const startedEvent = flow[0]

                // expect(startedEvent.id).toBeDefined()
                expect(startedEvent.id).toBeDefined()
                expect(startedEvent.name).toBe('action \'test.hello\'')
                expect(startedEvent.tags).toBeDefined()
                expect(startedEvent.tags.nodeId).toBe('node2')
                // expect(startedEvent.callerNodeId).toBe('node1')
                expect(startedEvent.tags.remoteCall).toBe(true)
                // expect(startedEvent.nodeId).toBe('node2')
                expect(startedEvent.startTime).toBeDefined()
                // expect(startedEvent.callerNodeId).toBe('node1')
            })
    })

    it('Finished event should be the expected format.', () => {
        return node1.call('test.hello')
            .then(res => {
                const startedEvent = flow[1]

                expect(startedEvent.id).toBeDefined()
                expect(startedEvent.name).toBe('action \'test.hello\'')
                expect(startedEvent.tags).toBeDefined()
                expect(startedEvent.tags.nodeId).toBe('node2')
                // expect(startedEvent.callerNodeId).toBe('node1')
                expect(startedEvent.startTime).toBeDefined()
                expect(startedEvent.finishTime).toBeDefined()
                expect(startedEvent.duration).toBeDefined()

                expect(startedEvent.tags.remoteCall).toBe(true)

                // expect(startedEvent.id).toBeDefined()
                // expect(startedEvent.requestId).toBeDefined()
                // expect(startedEvent.callerNodeId).toBe('node1')
                // expect(startedEvent.isRemoteCall).toBe(true)
                // expect(startedEvent.nodeId).toBe('node2')
                // expect(startedEvent.startTime).toBeDefined()
                // expect(startedEvent.callerNodeId).toBe('node1')
                // expect(startedEvent.stopTime).toBeDefined()
                // expect(startedEvent.isCachedResult).toBeDefined()
                // expect(startedEvent.isCachedResult).toBe(false)
                // expect(startedEvent.stopTime).toBeGreaterThan(startedEvent.startTime)
            })
    })
})
