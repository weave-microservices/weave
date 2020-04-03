/*
 * Author: Kevin Ries (kevin@fachw3rk.de)
 * -----
 * Copyright 2018 Fachwerk
 */

const Endpoint = (state, node, service, action) => {
  const self = Object.create(null)

  self.node = node
  self.service = service
  self.action = action
  self.isLocal = self.node.id === state.nodeId
  self.state = true
  self.name = `${node.id}:${action.name}`

  self.updateAction = (newAction) => {
    self.action = newAction
  }

  self.isAvailable = () => {
    return self.state
  }

  return self
}

module.exports = Endpoint
