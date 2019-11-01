const asyncHooks = require('async_hooks')
const executionAsyncId = asyncHooks.executionAsyncId;

module.exports = () => {
    const store = new Map()
    const hook = asyncHooks.createHook({
        init (asyncId, type, triggerAsyncId) {
            if (type === 'TIMEWRAP') {
                return
            }

            const item = store.get(triggerAsyncId)
            if (item) {
                store.set(asyncId, item)
            }
        },
        destroy (asyncId) {
            const item = store.get(asyncId)
            if (item) {
                store.delete(asyncId)
            }
        },
        promiseResolve (asyncId) {
            const item = store.get(asyncId)
            if (item) {
                store.delete(asyncId)
            }
        }
    })

    return {
        enable () {
            hook.enable()
        }
    }
}
