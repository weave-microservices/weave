const { Weave } = require('../../lib/index')

describe('Test internal service $node', () => {
    it('Five actions from "$node" should be available.', (done) => {
        const node1 = Weave({
            nodeId: 'node1',
            logger: {
                logLevel: 'fatal'
            }
        })

        node1.start().then(() => {
            node1.call('$node.actions')
                .then(res => {
                    expect(res.length).toBe(5)
                    done()
                })
        })
    })
})
