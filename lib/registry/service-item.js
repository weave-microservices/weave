const ServiceItem = (node, name, version, settings, local) => {
    const self = Object.create(null)

    self.name = name
    self.node = node
    self.settings = settings || {}
    self.version = version
    self.actions = {}
    self.events = {}
    self.isLocal = local

    self.addAction = (action) => {
        self.actions[action.name] = action
    }

    self.addEvent = (event) => {
        self.events[event.name] = event
    }

    self.equals = (name, version, node) => {
        return self.name === name && self.version === version && (node == null || self.node.id === node.id)
    }

    self.update = (service) => {
        self.settings = service.settings
        self.version = service.version
    }
    return self
}

module.exports = ServiceItem
