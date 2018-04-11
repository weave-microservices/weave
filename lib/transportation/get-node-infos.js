module.exports = ({ weave, registry, process }) =>
    () => {
        return {
            services: registry.getLocalNodeInfo(),
            nodeId: weave.nodeId,
            client: {
                type: 'node.js',
                version: weave.version,
                runtimeVersion: process.version
            }
        }
    }
