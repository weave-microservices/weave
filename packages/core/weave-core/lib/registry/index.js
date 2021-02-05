// @ts-check
/*
 * Author: Kevin Ries (kevin@fachw3rk.de)
 * -----
 * Copyright 2020 Fachwerk
*/

/**
 * @typedef {import('../types.js').Registry} Registry
 * @typedef {import('../types.js').NodeCollection} NodeCollection
 * @typedef {import('../types.js').ServiceCollection} ServiceCollection
 * @typedef {import('../types.js').ServiceActionCollection} ServiceActionCollection
 * @typedef {import('../types.js').EventCollection} EventCollection
 * @typedef {import('../types.js').Broker} Broker
 * @typedef {import('../types.js').Node} Node
 * @typedef {import('../types.js').MiddlewareHandler} MiddlewareHandler
 * @typedef {import('../types.js').ServiceChangedDelegate} ServiceChangedDelegate
*/

const { safeCopy } = require('@weave-js/utils')

// own packages
const { createNodeCollection } = require('./collections/node-collection')
const { createServiceCollection } = require('./collections/service-collection')
const { createActionCollection } = require('./collections/action-collection')
const { createEventCollection } = require('./collections/event-collection')
const { createActionEndpoint } = require('./action-endpoint')
const { createNode } = require('./node')
const { WeaveServiceNotFoundError, WeaveServiceNotAvailableError } = require('../errors')

const noop = () => {}

/**
 * Registry factory
 * @returns {Registry} Registry
*/
exports.createRegistry = () => {
  /**
   * @type {Registry}
  */
  const registry = {
  /**
   * Initialize the registry
   * @param {Broker} broker Broker instance
   * @param {MiddlewareHandler} middlewareHandler Middleware handler
   * @param {ServiceChangedDelegate} serviceChanged Service changed delegate
   * @returns {void}
   */
    init (broker, middlewareHandler, serviceChanged) {
      /**
       * @type {Broker}
      */
      this.broker = broker

      /**
       * @type {MiddlewareHandler}
      */
      this.middlewareHandler = middlewareHandler

      /**
       * @type {ServiceChangedDelegate}
      */
      this.serviceChanged = serviceChanged

      // init logger
      this.log = broker.createLogger('REGISTRY')

      // init collections
      this.nodeCollection = createNodeCollection(this)
      this.serviceCollection = createServiceCollection(this)
      this.actionCollection = createActionCollection(this)
      this.eventCollection = createEventCollection(this)

      // register an event handler for "$broker.started".
      this.broker.bus.on('$broker.started', () => {
        if (this.nodeCollection.localNode) {
          this.generateLocalNodeInfo(true)
        }
      })
    },
    onRegisterLocalAction: noop,
    onRegisterRemoteAction: noop,
    /**
     * Check action visibility
     * @param {*} action Action definition
     * @param {*} node Node object
     * @returns {Boolean} Is visible
    */
    checkActionVisibility (action, node) {
      if (typeof action.visibility === 'undefined' || action.visibility === 'public') {
        return true
      }

      if (action.visibility === 'protected' && node.isLocal) {
        return true
      }

      return false
    },
    registerLocalService (serviceSpecification) {
      if (!this.serviceCollection.has(serviceSpecification.name, serviceSpecification.version, this.broker.nodeId)) {
        const service = this.serviceCollection.add(this.nodeCollection.localNode, serviceSpecification.name, serviceSpecification.version, serviceSpecification.settings)

        if (serviceSpecification.actions) {
          this.registerActions(this.nodeCollection.localNode, service, serviceSpecification.actions)
        }

        if (serviceSpecification.events) {
          this.registerEvents(this.nodeCollection.localNode, service, serviceSpecification.events)
        }

        this.nodeCollection.localNode.services.push(service)

        this.generateLocalNodeInfo(this.broker.isStarted)

        if (serviceSpecification.version) {
          this.log.info(`Service '${service.name}' (v${serviceSpecification.version}) registered.`)
        } else {
          this.log.info(`Service '${service.name}' registered.`)
        }

        this.serviceChanged(true)
      }
    },
    registerRemoteServices (node, services) {
      services.forEach((service) => {
        // todo: handle events
        let oldActions
        let oldEvents
        let svc = this.serviceCollection.get(node.id, service.name, service.version)

        if (!svc) {
          svc = this.serviceCollection.add(node, service.name, service.version, service.settings)
        } else {
          // Update existing service with new actions
          oldActions = Object.assign({}, svc.actions)
          oldEvents = Object.assign({}, svc.events)
          svc.update(service)
        }

        if (service.actions) {
          this.registerActions(node, svc, service.actions)
        }

        if (service.events) {
          this.registerEvents(node, svc, service.events)
        }

        if (oldActions) {
          // this.deregisterAction()
          Object.keys(oldActions).forEach(actionName => {
            if (!service.actions[actionName]) {
              this.actionCollection.remove(actionName, node)
            }
          })
        }

        if (oldEvents) {
          Object.keys(oldEvents).forEach(eventName => {
            if (!service.actions[eventName]) {
              this.eventCollection.remove(eventName, node)
            }
          })
        }
      })

      // remove old services
      const oldServices = Array.from(this.serviceCollection.services)
      oldServices.forEach((service) => {
        if (service.node.id !== node.id) return

        let isExisting = false

        services.forEach((svc) => {
          if (service.equals(svc.name, svc.version)) {
            isExisting = true
          }
        })

        if (!isExisting) {
          this.deregisterService(service.name, service.version, node.id)
        }
      })

      this.serviceChanged(false)
    },
    registerEvents (node, service, events) {
      Object.keys(events).forEach((key) => {
        const event = events[key]

        if (node.isLocal) {
          event.handler = this.middlewareHandler.wrapHandler('localEvent', event.handler, event) // this.onRegisterLocalEvent(event)
        }

        this.eventCollection.add(node, service, event)
        service.addEvent(event)
      })
    },
    registerActions (node, service, actions) {
      Object.keys(actions).forEach((key) => {
        const action = actions[key]

        if (!this.checkActionVisibility(action, node)) {
          return
        }

        if (node.isLocal) {
          action.handler = this.middlewareHandler.wrapHandler('localAction', action.handler, action)// this.onRegisterLocalAction(action)
        } else {
          action.handler = this.middlewareHandler.wrapHandler('remoteAction', this.broker.transport.request.bind(this.broker.transport), action)// this.onRegisterRemoteAction(action)
        }

        this.actionCollection.add(node, service, action)

        service.addAction(action)
      })
    },
    getActionList (options) {
      return this.actionCollection.list(options)
    },
    deregisterService (name, version, nodeId) {
      this.serviceCollection.remove(nodeId || this.broker.nodeId, name, version)

      // It must be a local service
      if (!nodeId) {
        const serviceToRemove = this.nodeCollection.localNode.services.find(service => service.name === name)
        this.nodeCollection.localNode.services.splice(this.nodeCollection.localNode.services.indexOf(serviceToRemove), 1)
      }

      if (!nodeId || nodeId === this.broker.nodeId) {
        this.generateLocalNodeInfo(true)
      }
    },
    deregisterServiceByNodeId (nodeId) {
      return this.serviceCollection.removeAllByNodeId(nodeId)
    },
    hasService (serviceName, version, nodeId) {
      return this.serviceCollection.has(serviceName, version, nodeId)
    },
    getNextAvailableActionEndpoint (actionName, opts = {}) {
      if (typeof actionName !== 'string') {
        return actionName
      } else {
        // check if the action call is intended for a specific remote node
        if (opts.nodeId) {
          const endpoint = this.getActionEndpointByNodeId(actionName, opts.nodeId)

          // no endpoint for this action & node ID found
          if (!endpoint) {
            this.log.warn(`Service "${actionName}" is not registered on node ${opts.nodeId}.`)
            return new WeaveServiceNotFoundError({ actionName, nodeId: opts.nodeId })
          }

          return endpoint
        } else {
          const endpointList = this.getActionEndpoints(actionName)

          if (!endpointList) {
            this.log.warn(`Service "${actionName}" is not registered.`)
            return new WeaveServiceNotFoundError({ actionName })
          }

          const endpoint = endpointList.getNextAvailableEndpoint()

          if (!endpoint) {
            this.log.warn(`Service "${actionName}" is not available.`)
            return new WeaveServiceNotAvailableError({ actionName })
          }

          return endpoint
        }
      }
    },
    getActionEndpointByNodeId (actionName, nodeId) {
      const endpointList = this.getActionEndpoints(actionName)
      if (endpointList) {
        return endpointList.getByNodeId(nodeId)
      }
      return null
    },
    getActionEndpoints (actionName) {
      return this.actionCollection.get(actionName)
    },
    createPrivateActionEndpoint (action) {
      return createActionEndpoint(this.broker, this.nodeCollection.localNode, action.service, action)
    },
    getLocalActionEndpoint (actionName) {
      const endpointList = this.getActionEndpoints(actionName)

      if (!endpointList) {
        this.log.warn(`Service "${actionName}" is not registered localy.`)
        this.broker.handleError(new WeaveServiceNotFoundError({ actionName }))
      }

      const endpoint = endpointList.getNextLocalEndpoint()

      if (!endpoint) {
        this.log.warn(`Service "${actionName}" is not available localy.`)
        this.broker.handleError(new WeaveServiceNotAvailableError({ actionName }))
      }

      return endpoint
    },
    getNodeInfo (nodeId) {
      const node = this.nodeCollection.get(nodeId)

      if (!node) {
        return null
      }

      return node.info
    },
    getLocalNodeInfo (forceGenerateInfo) {
      if (forceGenerateInfo || !this.nodeCollection.localNode.info) {
        return this.generateLocalNodeInfo()
      }

      return this.nodeCollection.localNode.info
    },
    generateLocalNodeInfo (incrementSequence = false) {
      const { client, IPList, sequence } = this.nodeCollection.localNode
      const nodeInfo = { client, IPList, sequence }

      if (incrementSequence) {
        this.nodeCollection.localNode.sequence++
      }

      if (this.broker.isStarted) {
        nodeInfo.services = this.serviceCollection.list({
          localOnly: true,
          withActions: true,
          withEvents: true,
          withNodeService: this.broker.options.registry.publishNodeService,
          withSettings: true
        })
      } else {
        nodeInfo.services = []
      }

      this.nodeCollection.localNode.info = safeCopy(nodeInfo)
      return this.nodeCollection.localNode.info
    },
    processNodeInfo (payload) {
      /**
       * @type {string}
      */
      const nodeId = payload.sender

      /**
       * @type {Node}
      */
      let node = this.nodeCollection.get(nodeId)

      /**
       * @type {boolean}
      */
      let isNew = false

      /**
       * @type {boolean}
      */
      let isReconnected = false

      // There is no node with the specified ID. It must therefore be a new node.
      if (!node) {
        isNew = true
        node = createNode(nodeId)
        this.nodeCollection.add(nodeId, node)
      } else if (!node.isAvailable) {
        // Node exists, but is marked as unavailable. It must therefore be a reconnected node.
        isReconnected = true
        node.isAvailable = true
        node.lastHeartbeatTime = Date.now()
      }

      // todo: Handle multiple nodes with the same ID.
      const updateNesesary = node.update(payload, isReconnected)

      if (updateNesesary && node.services) {
        this.registerRemoteServices(node, node.services)
      }

      if (isNew) {
        this.broker.broadcastLocal('$node.connected', { node, isReconnected })
        this.log.info(`Node "${node.id}" connected!`)
      } else if (isReconnected) {
        this.broker.broadcastLocal('$node.connected', { node, isReconnected })
        this.log.info(`Node "${node.id}" reconnected!`)
      } else {
        this.broker.broadcastLocal('$node.updated', { node, isReconnected })
        this.log.info(`Node "${node.id}" updated!`)
      }
    },
    nodeDisconnected (nodeId, isUnexpected) {
      const node = this.nodeCollection.get(nodeId)
      if (node && node.isAvailable) {
        this.deregisterServiceByNodeId(node.id)
        node.disconnected(isUnexpected)
        this.broker.broadcastLocal('$node.disconnected', { nodeId, isUnexpected })
        this.log.warn(`Nodes "${node.id}"${isUnexpected ? ' unexpectedly' : ''} disconnected.`)
      }
    },
    removeNode (nodeId) {
      this.nodeCollection.remove(nodeId)
      this.broker.broadcastLocal('$node.removed', { nodeId })
      this.log.warn(`Node "${nodeId}" removed.`)
    },
    getNodeList (options) {
      return this.nodeCollection.list(options)
    },
    getServiceList (options) {
      return this.serviceCollection.list(options)
    }
  }

  return registry
}
