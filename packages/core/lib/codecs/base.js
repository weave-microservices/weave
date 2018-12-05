const makeBaseSerializer = (options) => {
    return {
        init () {

        },
        serialize (obj) {
            throw new Error('Serializer not implemented.')
        },
        deserialize (obj) {
            throw new Error('Deserialize not implemented.')
        }
    }
}

module.exports = makeBaseSerializer
