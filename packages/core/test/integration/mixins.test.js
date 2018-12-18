const { Weave } = require('../../lib/index')
const ServiceHookMixin = require('./mixins/service-hook.mixin')
const hasServiceScope = require('./scope-checks/service.scope')

describe('Service lifetime hooks within mixins', () => {
    it('should call lifecycle hook "created" with correct scope if there are nested hooks from a mixin.', done => {
        const node1 = Weave({
            nodeId: 'node1',
            logLevel: 'fatal'
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
            logLevel: 'fatal'
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
            logLevel: 'fatal'
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
            logLevel: 'fatal'
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
            logLevel: 'fatal'
        })

        node1.createService({
            name: 'testService',
            mixins: [ServiceHookMixin('stopped')],
            stopped () {
                // return Promise.reject(new Error('sss'))
            }
        })

        await expect(node1.start().then(() =>{
            return node1.stop()
        })).rejects.toThrow('Rejected hook from stopped')
    })
})
