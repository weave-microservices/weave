const TemplateGenerator = require('./generator')

module.exports = options => {
    const generator = TemplateGenerator(options)
    return (mail, callback) => generator.render(mail, callback)
}
