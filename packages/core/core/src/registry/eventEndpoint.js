/*
 * Author: Kevin Ries (kevin.ries@fachwerk.io)
 * -----
 * Copyright 2021 Fachwerk
 */

exports.createEventEndpoint = (broker, node, service, event) => {
  const eventEndpoint = Object.create(null);

  eventEndpoint.node = node;
  eventEndpoint.service = service;
  eventEndpoint.action = event;
  eventEndpoint.isLocal = eventEndpoint.node.id === broker.nodeId;
  eventEndpoint.state = true;
  eventEndpoint.name = `${node.id}:${event.name}`;

  eventEndpoint.updateEvent = (newEvent) => {
    eventEndpoint.action = newEvent;
  };

  eventEndpoint.isAvailable = () => {
    return eventEndpoint.state;
  };

  return eventEndpoint;
};
