/**
 * @fileoverview Shapes of the registry entries the explorer serves.
 */

/** A node as the registry lists it. */
export interface RegistryNode {
  id: string;
  isLocal?: boolean;
  isAvailable?: boolean;
  services?: Array<{ name: string }>;
  client?: Record<string, unknown>;
  cpu?: number | null;
  [key: string]: unknown;
}

/** The action definition of a registry entry. */
export interface RegistryAction {
  name: string;
  params?: Record<string, unknown>;
  [key: string]: unknown;
}

/** An action entry as the registry lists it. */
export interface RegistryActionEntry {
  action?: RegistryAction;
  count?: number;
  hasAvailable?: boolean;
  hasLocal?: boolean;
  [key: string]: unknown;
}

/** An event entry as the registry lists it. */
export interface RegistryEventEntry {
  name: string;
  groupName?: string;
  count?: number;
  hasAvailable?: boolean;
  [key: string]: unknown;
}

/** A service as the registry lists it. */
export interface RegistryServiceEntry {
  name: string;
  version?: string | number;
  nodeId?: string;
  [key: string]: unknown;
}

/** The registry collections the explorer reads from. */
export interface ExplorerRegistry {
  nodeCollection: { list(options?: Record<string, unknown>): RegistryNode[] };
  actionCollection: { list(options?: Record<string, unknown>): RegistryActionEntry[] };
  eventCollection: { list(options?: Record<string, unknown>): RegistryEventEntry[] };
  serviceCollection: { list(options?: Record<string, unknown>): RegistryServiceEntry[] };
}
