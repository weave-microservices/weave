const { Weave } = require('@weave-js/core')
const AuthService = require('../src/index')
const FakeAdapter = require('./adapter/fake-adapter')

describe('Test auth service', () => {
    let broker
    let service

    beforeEach(() => {
        broker = Weave({ logLevel: 'fatal' })
        service = weave.createService({
            name: 'authService',
            mixins: [AuthService],
            settings: {
                tokenSecret: '423423434234234',
                refreshTokenSecret: '231312312342374239842'
            },
            authAdapter: FakeAdapter()
        })
        weave.start()
    })

    it('Should be created', () => {
        expect(broker).toBeDefined()
        expect(broker.actions.authenticate).toBeDefined()
    })

    it('can authenticate', () => {
        broker.$internal.waitForServices(['authService']).then(() => {
            service.actions.authenticate({ credentials: { username: 'user', password: 'password' }}).then(user => {
                expect(user)
            })
        })

    })
})