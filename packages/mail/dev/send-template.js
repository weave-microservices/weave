const { Weave } = require('@weave-js/core')
const MailMixin = require('../lib/index')
const mg = require('nodemailer-mailgun-transport')
const path = require('path')

const broker = Weave({
    nodeId: 'mail',
    logger: {
        logLevel: 'debug'
    }
})
const root = path.join(__dirname, 'emails')

broker.createService({
    name: 'mailService',
    mixins: MailMixin,
    settings: {
        templates: {
            viewFolder: root
        },
        transport: mg({
            auth: {
                // eslint-disable-next-line
                api_key: 'key-cebfc400f533cd26b5764c79c0c786b3',
                domain: 'snitt.io'
            }
        }),
        showPreview: true
    }
})

broker.start()
    .then(() => {
        broker.call('mailService.send', {
            message: {
                template: 'test',
                from: 'selina.bruehl@gmx.de',
                to: 'kevin.ries@fachwerk.io',
                subject: 'testnachricht',
                variables: {
                    name: 'Kevin Ries'
                }
            }
        })
    })
