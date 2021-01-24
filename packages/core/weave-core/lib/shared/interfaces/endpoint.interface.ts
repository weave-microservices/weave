export interface Endpoint {
  node: Node,
  service: Service,
  action: ServiceAction,
  isLocal: boolean,
  state: boolean,
  name: string,
  updateAction(newAction: ServiceAction): void,
  isAvailable(): boolean,
}