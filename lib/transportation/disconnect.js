const connectFactory = ({ transport }) =>
    () => {
        return transport.close()
    }

module.exports = connectFactory
