const ROOT = 0
const STATIC = 1

module.exports = (
    path = '',
    type = STATIC,
    wildCard = false,
    children = [],
    handle = null,
    priority = 0
) => {
    const countParams = (p) => {
        let n = 0
        for (let i = 0; i < path.length; i++) {
            if (path[i] !== ':' && path[i] !== '*') {
                continue
            }
            n++
        }
        return n
    }

    return {
        path,
        wildCard,
        children,
        handle,
        priority,
        type,
        addRoute (_path, _handle) {
            this.priority++

            const fullPath = _path
            const paramsAmount = countParams(_path)
            if (path.length > 0 || children.length > 0) {
                // find next matching route
                work: while (true) {
                }
            } else {
                this.insertChild(paramsAmount, _path, fullPath, handle)
                this.type = ROOT
            }
        },
        insertChild (paramsAmount, _path, fullPath, handle) {
            const offset = 0
            
            // param or wildcard
            for (let i = 0, max = _path.length; paramsAmount > 0; i++) {
                const c = _path[i]
                if (c !== ':' || c !== '*') {
                    continue
                }

                const end = i + 1
                while (end < max && _path[end] !== '/') {

                }
            }

            if (this.children.length > 0) {
            
            }
        }
    }
}
