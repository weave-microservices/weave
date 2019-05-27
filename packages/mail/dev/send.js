const { Weave } = require('@weave-js/core')
const MailMixin = require('../lib/index')
const mg = require('nodemailer-mailgun-transport')

const broker = Weave({
    nodeId: 'mail'
})

broker.createService({
    name: 'mailService',
    mixins: MailMixin,
    settings: {
        transport: mg({
            auth: {
                // eslint-disable-next-line
                api_key: 'key-cebfc400f533cd26b5764c79c0c786b3',
                domain: 'snitt.io'
            }
        })
    }
})

broker.start()
    .then(() => {
        broker.call('mailService.send', {
            message: {
                from: 'selina.bruehl@gmx.de',
                to: 'kevin.ries@fachwerk.io',
                subject: 'testnachricht',
                text: 'hahahaha'
            }
        })
    })
