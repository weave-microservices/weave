const { Weave } = require('@weave-js/core')
const ApiService = require('../lib')
const request = require('supertest')
const path = require('path')

describe('Weave web service', () => {
    const store = {}

    beforeAll(() => {
        const broker = Weave({ logLevel: 'fatal' })

        store.broker = broker

        store.srv = broker.createService({
            mixins: [ApiService()],
            settings: {
                port: 7890,
                assets: {
                    folder: path.join(__dirname, 'public')
                },
                routes: [
                    {
                        path: '/api',
                        whitelist: ['math.*', 'auth.*']
                    }
                ]
            }
        })

        broker.createService({
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

        broker.createService({
            name: 'auth',
            actions: {
                login: {
                    params: {
                        username: { type: 'string' },
                        password: { type: 'string' }
                    },
                    handler: (context) => {
                        return context.params.username + '/' + context.params.password
                    }
                }
            }
        })

        broker.start()
    })
    afterAll(() => {
        store.broker.stop()
    })

    it('GET Asset', (done) => {
        request(store.srv.server).get('/index.html')
            .expect(200, 'Hello World')
            .then((res) => {
                done()
            })
    })

    it('GET correct content type', (done) => {
        request(store.srv.server).get('/index.html')
            .expect('Content-Type', 'text/html')
            .then(res => done())
    })

    it('GET correct content type for png', (done) => {
        request(store.srv.server).get('/img/Logo.png')
            .expect('Content-Type', 'image/png')
            .then(res => done())
    })

    it('GET /math', (done) => {
        request(store.srv.server).get('/api/math/test?p1=1&p2=1').expect(200, '2').then(() => {
            done()
        })
    })

    it('GET /auth', (done) => {
        request(store.srv.server).get('/api/auth/login?username=John&password=Doe').expect(200, '"John/Doe"').then(() => {
            done()
        })
    })
})
