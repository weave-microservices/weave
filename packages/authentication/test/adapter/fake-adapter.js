module.exports = (options) => {
    let service
    return {
        init (service) {
            service = service
        },
        authenticate (credentials) {
            const self = this
            return new Promise((resolve, reject) => {
                resolve()
            })
        } 
    }
}