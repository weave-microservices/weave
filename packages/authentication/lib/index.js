// const { promisify } = require('fachwork')

module.exports = {
    name: 'auth',
    settings: {
        tokenSecret: null,
        refreshTokenSecret: null
    },
    actions: {
        authenticate: {
            params: {
                credentials: { type: 'any' }
            },
            handler (context) {
                return this.adapter.authenticate(context.params.credentials)
                    .then(this.authentication)
            }
        },
        verify: {
            params: {
                token: { type: 'string' }
            },
            handler (context) {
                return this.verify(context, context.params.token)
            }
        },

    },
    methods: {
        refreshTokens (payload) {
            const createAccessToken = jwt.sign(
                payload,
                this.settings.tokenSecret,
                {
                    expiresIn: this.settings.tokenExpiresIn
                }
            )

            const createRefreshToken = jwt.sign(
                payload,
                this.settings.refreshTokenSecret,
                {
                    expiresIn: this.settings.refreshTokenExpiresIn
                }
            )

            return Promise.all([createAccessToken, createRefreshToken])
        },
        verify(context, token) {
            const self = this
            return new Promise((resolve, reject) => {
                try {
                    const payload = jwt.verify(token, self.settings.tokenSecret)
                    return resolve(payload)
                } catch (error) {
                    return reject(error)
                }
            })
        }
    },
    created () {
        if (this.schema.authAdapter) {
            this.adapter = this.schema.authAdapter
            this.adapter.init(this)
        } else {
            throw new Error('Auth adapter not defined.')
        }
        if (!this.schema.authenticate) {
            throw new Error('Authenticate method have to be implemented.')
        }
    },
    started () {
        if (!this.adapter) {
            return Promise.reject('You have to specify an Authentication adapter: authAdapter is missing!')
        }
    }
}
