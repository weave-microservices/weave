const Weave = require('weave')
const DbService = require('../src/weave-db')
const assert = require('assertthat')

describe('db-service', () => {
    let weave
    let testService
    before(() => {
        weave = Weave()
        testService = weave.createService({
            name: 'test',
            mixins: DbService,
            model: {
                name: 'test'
            },
            settings: {
                // fields: ['id', 'name']
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
        weave.start().then(() => {
            weave.call('test.create', { entity: { name: 'kevin', secondName: 'ries' }}).then(() => {
                done()
            })
        })
    })

    it('find', (done) => {
        weave.start().then(() => {
            weave.call('test.find', { name: 'kevin' }).then((res) => {
                assert.that(res.length).is.atLeast(0)
                done()
            })
        })
    })

    it('update', (done) => {
        weave.start().then(() => {
            weave.call('test.find', { name: 'kevin' }).then((res) => {
                const itemToUpdate = res[res.length - 1]
                weave.call('test.update', { id: itemToUpdate.id, update: { name: 'matz', age: 10 }}).then((res) => {
                    assert.that(res.name).is.equalTo('matz')
                    done()
                })
            })
        })
    })

    it('remove', (done) => {
        weave.start().then(() => {
            weave.call('test.find', { name: 'matz' }).then((res) => {
                const itemToUpdate = res[res.length - 1]
                weave.call('test.remove', { id: itemToUpdate.id }).then((res) => {
                    weave.call('test.find', { id: res.id }).then((res) => {
                        assert.that(res.length).is.equalTo(0)
                        done()
                    })
                })
            })
        })
    })

    it('count', (done) => {
        weave.start().then(() => {
            weave.call('test.count').then((res) => {
                done()
            })
        })
    })
})
