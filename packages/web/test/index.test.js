const Weave = require('weave-core')
const ApiService = require('../src')
const request = require('supertest')
const path = require('path')

describe('Weave web service', () => {
    let weave
    let service
    beforeEach(() => {
        weave = Weave({ logLevel: 'debug' })
        weave.createService({
            name: 'math',
            actions: {
                test: {
                    params: {
                        p1: { type: 'number', convert: true },
                        p2: { type: 'number', convert: true }
                    },
                    handler: (context) => {
                        return Number(context.params.p1) + Number(context.params.p2)
                    }
                }
            }
        })
        service = weave.createService({
            mixins: ApiService,
            settings: {
                assets: {
                    folder: path.join(__dirname, 'public')
                },
                routes: [
                    {
                        path: '/math',
                        onBeforeCall (context, route) {
                            console.log('feuer!!!')
                        }
                    }
                ]
            }
        })
        weave.start()
    })
    after(() => {
        weave.stop()
    })

    it('GET /file', (done) => {
        request(service.server).get('/').expect(200).then((res) => {
            done()
        })
    })

    it('GET /math', (done) => {
        request(service.server).get('/math/test?p1=1&p2=1').expect(200, '2').then(() => {
            done()
        })
    })

    it('GET /login', (done) => {
        request(service.server).get('/math/test?p1=1&p2=1').expect(200, '4').then(() => {
            done()
        })
    })
})
