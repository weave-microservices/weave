/*
 * Author: Kevin Ries (kevin@fachw3rk.de)
 * -----
 * Copyright 2020 Fachwerk
 */

import { Broker } from "../shared/interfaces/broker.interface"
import { Node } from "../shared/interfaces/node.interface"
import { Service } from "../shared/interfaces/service.interface"

export function createEventEndpoint(broker: Broker, node: Node, service: Service, event) {
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
