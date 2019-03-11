module.exports = {
    name: 'buttler',
    settings: {},
    // dependencies: [],
    actions: {
        sayHello () {
            return 'Hello from Weave'
        },
        welcome: {
            params: {
                name: 'string'
            },
            handler (context) {
                return `Welcome, ${context.params.name}`
            }
        }
    },
    events: {

    },
    methods: {

    },
    created () {

    },
    started () {

    },
    stopped () {

    }
}
