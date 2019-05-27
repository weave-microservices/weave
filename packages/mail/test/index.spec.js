
const { Weave } = require('@weave-js/core')
const MailService = require('../lib/index')

describe('Test email service', () => {
    it('Should be created', () => {
        const weaveApp = Weave({ logLevel: 'fatal' })
        const service = weaveApp.createService(MailService)
        expect(service).toBeDefined()
    })
})


describe('Test sending', () => {
    const spySendMail = jest.fn((msg, cb) => cb(null, msg));

    
    let weaveApp, svc
    beforeEach(() => {
         weaveApp = Weave({ logLevel: 'fatal' })
         svc = MailService
    })

    it('should call nodemailer.sendmail', (done) => {
        const mailService = weaveApp.createService({
            mixins: [svc],
            settings: {
                from: 'kevin@fachw3rk.de'
            }
        })

        mailService.transporter = {
            sendMail: spySendMail
        }

        const params = {
            to: 'info@fachw3rk.de'
        }

        weaveApp.call('mail.send', { params }).then(res => {
            // todo res should equal params
            // sendSpyMail should be called with params
            // expect(res).toBe(params)
            expect(spySendMail).toHaveBeenCalledTimes(1);
            done()
        })
    })
})