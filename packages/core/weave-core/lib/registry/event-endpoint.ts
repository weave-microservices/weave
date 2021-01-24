/*
 * Author: Kevin Ries (kevin@fachw3rk.de)
 * -----
 * Copyright 2020 Fachwerk
 */

import { Broker } from "../broker/broker"
import { Node } from "./node"
import { Service } from "./service"

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
