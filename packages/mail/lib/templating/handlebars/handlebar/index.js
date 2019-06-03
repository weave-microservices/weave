const Renderer = require('./renderer')

module.exports = {
    create (config) {
        return new Renderer(config)
    }
}
