
module.exports = (options) => {
    let srv
    return {
        init (service) {
            if (!options.usernameField) {
                throw new Error('You have to define a password field.')
            }

            if (!options.passwordField) {
                throw new Error('You have to define a password field.')
            }
            srv = service

        },
        authenticate (credentials) {
            if (!credentials[options.usernameField] || !credentials[options.passwordField]) {
                return Promise.reject('Invalid credenials')
            }
            return srv.schema.authenticate.call(srv, credentials[options.usernameField], credentials[options.passwordField])
        } 
    }
}