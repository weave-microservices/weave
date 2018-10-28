
module.exports = options => {
    return {
        name: 'superMixin',
        initializer (helps) {

        },
        actions: {
            concat: {
                handler (context) {
                    return 'from' + this.name
                }
            }
        },
        methods: {
            sayHello (name) {
                console.log(name)
            }
        }
    }
}
