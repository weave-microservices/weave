/*
 * Author: Kevin Ries (kevin@fachw3rk.de)
 * -----
 * Copyright 2018 Fachwerk
 */

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
