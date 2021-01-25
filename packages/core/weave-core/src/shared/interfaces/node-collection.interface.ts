import { NodeCollectionListFilterParams } from "../types/node-collection-list-filter-params.type";
import { Node } from "./node.interface";

export interface NodeCollection {
  localNode?: Node,
  hostname?: string,
  createNode(nodeId: string): Node,
  add(nodeId: string, node: Node): void,
  has(nodeId: string): boolean,
  get(nodeId: string): Node,
  remove(nodeId: string): boolean,
  list(filterParams: NodeCollectionListFilterParams): Array<Node>,
  disconnected(nodeId: string, isUnexpected: boolean): void,
  toArray(): Array<Node>
}