const { Weave } = require('../../lib/index')
const ServiceHookMixin = require('./mixins/service-hook.mixin')
const hasServiceScope = require('./scope-checks/service.scope')

describe('Cache system', () => {
    it('should call lifecycle hook "created" with correct scope if there are nested hooks from a mixin.', (done) => {
        const node1 = Weave({
            nodeId: 'node1',
            logger: {
                logLevel: 'fatal'
            },
            cache: {
                enabled: true
            }
        })

        node1.createService({
            name: 'testService',
            actions: {
                cachedAction: {
                    cache: {
                        keys: ['text']
                    },
                    handler (context) {
                        return context.params.text.split('').reverse().join('')
                    }
                }
            }
        })
        node1.start().then(() => {
            node1.call('testService.cachedAction', { text: 'hallo kevin' })
                .then(result => {
                    expect(result).toBe('nivek ollah')
                    node1.stop()
                    done()
                })
        })
    })
})
