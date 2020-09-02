/*
 * Author: Kevin Ries (kevin@fachw3rk.de)
 * -----
 * Copyright 2020 Fachwerk
 */

exports.createEventEndpoint = (broker, node, service, event) => {
  const self = Object.create(null)

  self.node = node
  self.service = service
  self.event = event
  self.isLocal = self.node.id === broker.nodeId
  self.state = true
  self.name = `${node.id}:${event.name}`

  self.updateEvent = (newEvent) => {
    self.event = newEvent
  }

  self.isAvailable = () => {
    return self.state
  }

  return self
}
