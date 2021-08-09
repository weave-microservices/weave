/*
 * Author: Kevin Ries (kevin@fachw3rk.de)
 * -----
 * Copyright 2020 Fachwerk
 */

exports.createEventEndpoint = (broker, node, service, event) => {
  const eventEndpoint = Object.create(null)

  eventEndpoint.node = node
  eventEndpoint.service = service
  eventEndpoint.event = event
  eventEndpoint.isLocal = eventEndpoint.node.id === broker.nodeId
  eventEndpoint.state = true
  eventEndpoint.name = `${node.id}:${event.name}`

  eventEndpoint.updateEvent = (newEvent) => {
    eventEndpoint.event = newEvent
  }

  eventEndpoint.isAvailable = () => {
    return eventEndpoint.state
  }

  return eventEndpoint
}
