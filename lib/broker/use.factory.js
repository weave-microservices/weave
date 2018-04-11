const useFactory = ({ state }) =>
    middleware => {
        if (typeof middleware === 'function') {
            state.middlewares.push(middleware)
        }
    }

module.exports = useFactory
