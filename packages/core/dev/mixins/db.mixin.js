
const DeepMixin = require('./db2.mixin')

module.exports = options => {
    return {
        name: 'superMixin',
        mixins: [DeepMixin({})],
        initializer (helps) {

        },

        methods: {
            sayGoodbye (name) {
                console.log(name)
            }
        }
    }
}
