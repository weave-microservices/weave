const Endpoint = (state, node, service, action) => {
    const self = Object.create(null)

    self.node = node
    self.service = service
    self.action = action
    self.local = self.node.id === state.nodeId
    self.state = true

    self.updateAction = (newAction) => {
        self.action = newAction
    }

    self.isAvailable = () => {
        return self.state
    }

    return self
}

module.exports = Endpoint
