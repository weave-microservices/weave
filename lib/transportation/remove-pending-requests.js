module.exports = ({ pendingRequests }) =>
    nodeId => {
        pendingRequests.delete(nodeId)
    }
