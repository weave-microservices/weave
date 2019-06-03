const path = require('path')
const handlebars = require('./handlebar')

module.exports = opts => {
    let viewEngine = opts.viewEngine || {}
    viewEngine.partialsDir = viewEngine.partialsDir || opts.viewFolder
    // viewEngine.layoutsDir = viewEngine.layoutsDir || opts.viewFolder
    if (!viewEngine.renderView) {
        viewEngine = handlebars.create(viewEngine)
    }
    // this.viewEngine = viewEngine
    const viewPath = opts.viewFolder
    const extensionName = opts.extName || '.handlebars'

    return {
        render (mail, callback) {
            if (mail.data.html) return callback()

            const templatePath = path.join(viewPath, mail.data.template + extensionName)

            viewEngine.renderView(templatePath, mail.data.variables, (err, body) => {
                if (err) {
                    return callback(err)
                }

                mail.data.html = body
                callback()
            })
        }
    }
}
