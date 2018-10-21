const Weave = require('weave')
const DbService = require('weave-db')
const assert = require('assertthat')

describe('db-service', () => {
    let weave
    let testService
    before(() => {
        weave = Weave()
        testService = weave.createService({
            name: 'test',
            mixins: DbService,
            adapter: require('../src/index')({
                url: 'mongodb://localhost:27017/test'
            }),
            model: {
                name: 'test',
                options: {},
                schema: {
                    hash: { type: 'string' },
                    coordinates: { type: 'array', contains: { type: 'double' }}
                }
            },
            settings: {
                // fields: ['id', 'name']
            },
            afterConnect: () => {
                weave.call('test.create', { entity: { hash: '123455', coordinates: [1, 3] }}).then((result) => {
                    console.log('sadas')
                })
            }
        })
    })
    it('DB-Service methods', () => {
        const methods = ['get', 'find', 'create', 'update', 'remove']
        methods.forEach((method) => {
            assert.that(testService[method]).is.not.undefined()
        })
    })

    it('create', (done) => {
        weave.start()
    })
})
