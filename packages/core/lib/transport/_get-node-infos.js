/*
 * Author: Kevin Ries (kevin@fachw3rk.de)
 * -----
 * Copyright 2018 Fachwerk
 */

module.exports = ({ weave, registry, process }) =>
    () => {
        return {
            client: {
                runtimeVersion: process.version,
                type: 'node.js',
                version: weave.version
            },
            nodeId: weave.nodeId,
            services: registry.getLocalNodeInfo()
        }
    }
