
const Weave = require('weave-core')
const AuthService = require('../src/index')
const FakeAdapter = require('./adapter/fake-adapter')

describe('Test auth service', () => {
    let weave
    let service

    beforeEach(() => {
        weave = Weave({ logLevel: 'fatal' })
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
        expect(service).toBeDefined()
        expect(service.actions.authenticate).toBeDefined()
    })

    it('can authenticate', () => {
        weave.$internal.waitForServices(['authService']).then(() => {
            service.actions.authenticate({ credentials: { username: 'user', password: 'password' }}).then(user => {
                expect(user)
            })
        })

    })
})