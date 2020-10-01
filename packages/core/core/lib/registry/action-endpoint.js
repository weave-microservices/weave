/*
 * Author: Kevin Ries (kevin@fachw3rk.de)
 * -----
 * Copyright 2020 Fachwerk
 */

exports.createActionEndpoint = (broker, node, service, action) => {
  const endpoint = {
    node,
    service,
    action,
    isLocal: node.id === broker.nodeId,
    state: true,
    name: `${node.id}:${action.name}`
  }

  endpoint.updateAction = (newAction) => {
    endpoint.action = newAction
  }

  endpoint.isAvailable = () => {
    return endpoint.state === true
  }

  return endpoint
}
