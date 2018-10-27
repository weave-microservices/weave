const fs = require('fs')
const Email = require('email-templates')

module.exports = {
    name: 'mail',
    settings: {
        from: null
    },
    actions: {
        send: {
            params: {
                message: { type: 'object' }
            },
            handler (context) {

                if (!sendOptions.message.from) {
                    sendOptions.message.from = this.settings.from
                }
    
                if (this.email) {
                    return this.email.send(context.params)
                } else {
                    return Promise.reject(new WeaveError('Email transport could not be loaded.'))
                }
            }
        }
    },
    created () {
        if (!this.settings.transport) {
            this.log.error('Transport settings are missing.')
            return
        }

        if (this.settings.templateFolder) {
            if (!fs.existsSync(this.settings.templateFolder)) {
                this.log.warn(`The template folder is not existing: ${this.settings.templateFolder}`)
            }
        }

        const options = {
            transport: this.settings.transport,
            send: true
        }
        if (this.settings.from) {
            options.message = {
                from: this.settings.from
            }
        }
        this.email = new Email(options)
        this.log.info(`Email transport initialized.`)

    }
}
