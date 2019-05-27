const { existsSync } = require('fs')
const { join } = require('path')
const nodemailer = require('nodemailer')
const { WeaveError } = require('@weave-js/core').Errors
const { HandlebarsRenderer } = require('./templating')

module.exports = {
    name: 'mail',
    settings: {
        transport: null,
        templates: {
            engine: 'handlebars',
            viewFolder: null
        },
        from: null
    },
    actions: {
        send: {
            params: {
                message: { type: 'object' },
                data: { type: 'object', optional: true }
            },
            handler (context) {
                const { message } = context.params
                // if (message.template) {
                //     if (this.templateFileNotExists(message.template)) {
                //         return Promise.reject(new WeaveError(`Email template is missing: ${message.template}`))
                //     }
                // }
                return this.send(message)
            }
        }
    },
    methods: {
        templateFileNotExists (file) {
            return !existsSync(join(this.settings.templates.viewFolder, file))
        },
        send (message) {
            return new Promise((resolve, reject) => {
                if (!message.from) {
                    message.from = this.settings.from
                }

                this.transport.sendMail(message, (error, info) => {
                    if (error) {
                        return reject(error)
                    }
                    resolve(info)
                })
            })
        }
    },
    created () {
        if (!this.settings.transport) {
            this.log.error('Transport settings are missing.')
            throw new WeaveError('Transport settings are missing.')
        }

        this.transport = nodemailer.createTransport(this.settings.transport)

        if (this.settings.templates.viewFolder) {
            if (!existsSync(this.settings.templates.viewFolder)) {
                this.log.warn(`The template folder is not existing: ${this.settings.templates.viewFolder}`)
                throw new WeaveError(`The template folder is not existing: ${this.settings.templates.viewFolder}`)
            }
            this.useTemplates = true
            this.transport.use('compile', HandlebarsRenderer(this.settings.templates))
        }

        this.log.info(`Email transport initialized.`)
    }
}
