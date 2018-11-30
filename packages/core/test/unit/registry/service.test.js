const serviceFactory = require('../../../lib/registry/service')
const state = require('../mock/state')
const actionWrapperFactory = require('../../../lib/broker/action-wrapper.factory')

const wrapAction = actionWrapperFactory({ state })
const contextFactoryFactory = require('../../../lib/broker/context.factory')
// const shouldCollectMetricsFactory = require('../../../lib/broker/should-collect-metrics.factory')

const contextFactory = require('../../../lib/broker/context')

// const shouldCollectMetrics = shouldCollectMetricsFactory({ state, options: state.options })

const makeContext = contextFactory({
    state,
    call: jest.fn(),
    emit: jest.fn(),
    options: state.options,
    bus: {}
})
const makeContextFactory = contextFactoryFactory({ state, Context: makeContext })

describe('Service generation', () => {
    let makeService

    beforeEach(() => {
        makeService = serviceFactory({
            state,
            addLocalService: jest.fn(),
            cacher: {},
            call: jest.fn(),
            getLogger: jest.fn(),
            contextFactory: makeContextFactory,
            emit: jest.fn(),
            getNextActionEndpoint: jest.fn(),
            log: jest.fn(),
            validator: jest.fn(),
            registry: jest.fn(),
            statistics: jest.fn()
        })
    })

    it('Should throw an error, if the service schema is missing.', () => {
        expect(() => {
            makeService()
        }).toThrow('Schema is missing!')
    })

    it('Should throw an error, if the service name is missing.', () => {
        expect(() => {
            makeService({
                // name: 'someServiceName'
            })
        }).toThrow('Service name is missing!')
    })

    it('Should have a broker interface', () => {
        const service = makeService({
            name: 'someServiceName'
        })
        expect(service.broker).toBeDefined()
        expect(service.broker.options).toBeDefined()
        expect(service.broker.cacher).toBeDefined()
        expect(service.broker.call).toBeDefined()
        expect(service.broker.contextFactory).toBeDefined()
        expect(service.broker.emit).toBeDefined()
        expect(service.broker.getLogger).toBeDefined()
        expect(service.broker.getNextActionEndpoint).toBeDefined()
        expect(service.broker.log).toBeDefined()
        expect(service.broker.validator).toBeDefined()
        expect(service.broker.registry).toBeDefined()
        expect(service.broker.statistics).toBeDefined()
        expect(service.broker.log).toBeDefined()
    })

    it('Should have a interface', () => {
        const schema = {
            name: 'someServiceName'
        }

        const service = makeService(schema)

        expect(service.name).toEqual('someServiceName')
        expect(service.schema).toEqual(schema)
        expect(service.actions).toBeInstanceOf(Object)
        expect(service.broker).toBeDefined()
        expect(service.settings).toBeDefined()
        expect(service.started).toBeDefined()
        expect(service.state).toBeDefined()
        expect(service.version).toBeUndefined()
    })
})

describe('Test action creation', () => {
    let makeService

    beforeEach(() => {
        makeService = serviceFactory({
            state,
            addLocalService: jest.fn(),
            cacher: {},
            call: jest.fn(),
            getLogger: jest.fn(),
            contextFactory: makeContextFactory,
            emit: jest.fn(),
            getNextActionEndpoint: jest.fn(),
            log: jest.fn(),
            validator: jest.fn(),
            registry: jest.fn(),
            statistics: jest.fn(),
            wrapAction

        })
    })

    it('Should call hooks.', () => {
        const schema = {
            name: 'someService',
            actions: {
                find: jest.fn()
            },
            created: jest.fn(),
            beforeCreate: jest.fn()
        }

        makeService(schema)

        expect(schema.beforeCreate).toBeCalled()
        expect(schema.created).toBeCalled()
    })

    it('Should register new actions in beforeCreate hook.', () => {
        const schema = {
            name: 'someService',
            actions: {
                find: jest.fn()
            },
            beforeCreate () {
                this.actions.doIt = {
                    params: {},
                    handler (context) {}
                }
            }
        }

        const service = makeService(schema)

        expect(service.actions.doIt).toBeDefined()
        expect(service.actions.find).toBeDefined()
    })

    it('Should register and call actions', () => {
        const schema = {
            name: 'someService',
            actions: {
                find: jest.fn()
            }
        }

        const service = makeService(schema)
        service.actions.find({})

        expect(schema.actions.find).toBeCalled()
    })
})
