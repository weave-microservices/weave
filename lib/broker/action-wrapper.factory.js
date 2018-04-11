// Middleware action wrapper
const actionWrapperFactory = ({ state }) =>
    action => {
        let handler = action.handler
        if (state.middlewares.length) {
            handler = state.middlewares.reduce((handler, middleware) => {
                return middleware(handler, action)
            }, handler)
        }
        action.handler = handler
        return action
    }

module.exports = actionWrapperFactory
