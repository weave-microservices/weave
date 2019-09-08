const Node = require('./node')
module.exports = () => {
    return {
        tree: {},
        on (method, path, handler) {
            if (!this.tree[method]) {
                this.tree[method] = Node()
            }
            this.tree[method].addRoute(path, handler)
            return this
        },
        resolve () {}
    }
}
