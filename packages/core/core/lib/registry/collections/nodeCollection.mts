/*
 * Author: Kevin Ries (kevin.ries@fachwerk.io)
 * -----
 * Copyright 2021 Fachwerk
 */

import { getIpList, omit } from "@weave-js/utils";
import { createNode } from "../node.mts";
import type { Node, NodeCollection, Registry } from "../../../types/index.js";
/**
 * Node list options interface
 */
interface NodeListOptions {
  withServices?: boolean;
}

/**
 * Create node collection
 * @param registry Registry reference
 * @return Node collection
 */
export const createNodeCollection = (registry: Registry): NodeCollection => {
  const nodeCollection: NodeCollection = Object.create(null);
  const { runtime } = registry;
  const nodes = new Map<string, Node>();

  nodeCollection.localNode = null as unknown as Node;

  nodeCollection.createNode = (nodeId: string): Node => {
    return createNode(nodeId);
  };

  nodeCollection.add = (nodeId: string, node: Node): void => {
    nodes.set(nodeId, node);
  };

  (nodeCollection as any).has = (nodeId: string): boolean => {
    return nodes.has(nodeId);
  };

  nodeCollection.get = (nodeId: string): Node | undefined => {
    return nodes.get(nodeId);
  };

  nodeCollection.remove = (nodeId: string): void => {
    nodes.delete(nodeId);
  };

  nodeCollection.list = ({ withServices = true }: NodeListOptions = {}): Node[] => {
    const result: Node[] = [];
    nodes.forEach((node: Node) => {
      if (withServices) {
        result.push(omit(node, ["info"]) as Node);
      } else {
        result.push(omit(node, ["info", "services"]) as Node);
      }
    });
    return result;
  };

  nodeCollection.disconnected = (nodeId: string, isUnexpected?: boolean): void => {
    const node = nodes.get(nodeId);
    if (node && node.isAvailable) {
      registry.deregisterServiceByNodeId(node.id);
      node.disconnected(isUnexpected);
      runtime.eventBus.broadcastLocal("$node.disconnected", { nodeId, isUnexpected });
      registry.log.warn(`Node '${node.id}'${isUnexpected ? " unexpectedly" : ""} disconnected.`);
    }
  };

  nodeCollection.toArray = (): Node[] => {
    const result: Node[] = [];
    nodes.forEach((node: Node) => result.push(node));
    return result;
  };

  // get Local node information and add it to the collection by
  const addLocalNode = (): Node => {
    const node = createNode(runtime.options.nodeId!);

    node.isLocal = true;
    node.IPList = getIpList();
    node.client = {
      type: "nodejs",
      version: runtime.version,
      langVersion: process.version,
    };

    node.sequence = 1;
    nodeCollection.add(node.id, node);
    nodeCollection.localNode = node;

    return node;
  };

  addLocalNode();

  return nodeCollection;
};
