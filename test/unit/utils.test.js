const Weave = require('../../lib')
const Service = require('../../lib/registry/service')
const { mergeSchemas } = require('../../lib/utils')

describe('utils', () => {
    let weave
    beforeEach(() => {
        weave = Weave({
            logLevel: 'fatal'
        })
    })
    it('should merge schemas', () => {
        const service1 = Service(weave.$internal, {
            name: 'service1',
            actions: {
                say () {},
                hello () {}
            }
        })
        const service2 = {
            name: 'service2',
            actions: {
                do () {},
                something () {}
            }
        }
        const result = mergeSchemas(service1, service2)

        expect(result.actions.say).toBeDefined()
        expect(result.actions.hello).toBeDefined()
        expect(result.actions.do).toBeDefined()
        expect(result.actions.something).toBeDefined()
    })
})
