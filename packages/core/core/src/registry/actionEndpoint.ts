/*
 * Author: Kevin Ries (kevin.ries@fachwerk.io)
 * -----
 * Copyright 2021 Fachwerk
 */

import { Runtime } from "../runtime/Runtime";
import { Service } from "../service/Service";
import { Node } from "./node";

type Action = any;

class Endpoint {
  public action: Action;
  public service: Service;
  public isLocal: boolean;
  public isAvailable: boolean;

  constructor (runtime: Runtime, node: Node, service: Service) {
    this.isLocal = node.id === runtime.nodeId
  }

}

class ActionEndpoint extends Endpoint {
  public action: Action;

  constructor (runtime: Runtime, node: Node, service: Service, action: Action) {
    super(runtime, node, service);
    this.action = action;
  }

  updateAction = (newAction: Action) => {
    this.action = newAction;
  }
}

export { ActionEndpoint };


// exports.createActionEndpoint = (runtime, node, service, action) => {
//   const endpoint = {
//     node,
//     service,
//     action,
//     isLocal: node.id === runtime.nodeId,
//     state: true,
//     name: `${node.id}:${action.name}`
//   };

//   endpoint.updateAction = (newAction) => {
//     endpoint.action = newAction;
//   };

//   endpoint.isAvailable = () => {
//     return endpoint.state === true;
//   };

//   return endpoint;
// };
