/*
 * Author: Kevin Ries (kevin.ries@fachwerk.io)
 * -----
 * Copyright 2021 Fachwerk
 */
'use strict';

import { Node } from "./Node";

class ServiceItem {
  public name: string;
  public node: Node;
  public settings: unknown;
  public version: number;
  public actions: Record<string, any>;
  public events: Record<string, any>;
  public isLocal: boolean;

  constructor (node: Node, name: string, version: number, settings: unknown, isLocal: boolean) {
    this.name = name;
    this.node = node;
    this.settings = settings;
    this.version = version;
    this.isLocal = isLocal;
    this.actions = {}
    this.events = {}
  }

  addAction (action: any) {
    this.actions[action.name] = action;
  };

  addEvent (event: any) {
    this.events[event.name] = event;
  };

  equals (name: string, version: number | undefined, nodeId: string) {
    return this.name === name &&
      this.version === version &&
      (nodeId == null || this.node.id === nodeId);
  };

  update (service: any) {
    this.settings = service.settings;
    this.version = service.version;
  };
}

export { ServiceItem };

// exports.createServiceItem = () => {
//   /**
//    * @type {ServiceItem}
//   */
//   const serviceItem = Object.create(null);

//   serviceItem.name = name;
//   serviceItem.node = node;
//   serviceItem.settings = settings || {};
//   serviceItem.version = version;
//   serviceItem.actions = {};
//   serviceItem.events = {};
//   serviceItem.isLocal = isLocal;

//   serviceItem.addAction = (action) => {
//     serviceItem.actions[action.name] = action;
//   };

//   serviceItem.addEvent = (event) => {
//     serviceItem.events[event.name] = event;
//   };

//   serviceItem.equals = (name, version, nodeId) => {
//     return serviceItem.name === name && serviceItem.version === version && (nodeId == null || serviceItem.node.id === nodeId);
//   };

//   serviceItem.update = (service) => {
//     serviceItem.settings = service.settings;
//     serviceItem.version = service.version;
//   };

//   return serviceItem;
// };
