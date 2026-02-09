import { EventEmitter } from "events";
import type { Runtime, ServiceManager } from "../../types/internal.js";

interface FakeRuntimeOptions {
  nodeId?: string;
  tracing?: Record<string, unknown>;
  [key: string]: unknown;
}

type FakeRuntime = Runtime & {
  services: ServiceManager;
};

export const createFakeRuntime = (options: FakeRuntimeOptions = {}): FakeRuntime => {
  const bus = new EventEmitter();

  // Create minimal fake implementations for required Runtime properties
  const fakeRuntime = {
    nodeId: options.nodeId ?? "test-node",
    version: "1.0.0",
    options: options as any,
    bus,
    state: {
      isStarted: false,
      instanceId: "test-instance",
      trackedContexts: [],
    },
    actionInvoker: {
      call: async () => undefined,
      multiCall: async () => [],
    },
    eventBus: {
      emit: async () => {},
      broadcast: async () => {},
      broadcastLocal: () => {},
    },
    middlewareHandler: {
      wrapHandler: (type: string, handler: any) => handler,
      callHandlersSync: () => {},
      callHandlersAsync: async () => {},
      add: () => {},
      use: () => {},
      registeredHooks: {} as any,
      localAction: (handler: any) => handler,
      remoteAction: (handler: any) => handler,
      localEvent: (handler: any) => handler,
    },
    contextFactory: {
      create: () => ({} as any),
      createFromService: () => ({} as any),
    },
    registry: {
      runtime: null as any,
      log: null as any,
      nodeCollection: {} as any,
      serviceCollection: {} as any,
      actionCollection: {} as any,
      eventCollection: {} as any,
      init: () => {},
      registerLocalService: () => {},
      registerRemoteServices: () => {},
      registerActions: () => {},
      registerEvents: () => {},
      deregisterService: () => {},
      deregisterServiceByNodeId: () => {},
      hasService: () => false,
      getNextAvailableActionEndpoint: () => ({} as any),
      getActionEndpointByNodeId: () => null,
      getActionEndpoints: () => ({}),
      getLocalActionEndpoint: () => undefined,
      createPrivateActionEndpoint: () => ({} as any),
      checkActionVisibility: () => true,
      getNodeInfo: () => null,
      getLocalNodeInfo: () => ({} as any),
      generateLocalNodeInfo: () => ({} as any),
      processNodeInfo: () => {},
      nodeDisconnected: () => {},
      removeNode: () => {},
    },
    log: {
      trace: () => {},
      debug: () => {},
      info: () => {},
      warn: () => {},
      error: () => {},
      fatal: () => {},
    } as any,
    createLogger: () => ({
      trace: () => {},
      debug: () => {},
      info: () => {},
      warn: () => {},
      error: () => {},
      fatal: () => {},
    }) as any,
    generateUUID: () => "test-uuid",
    handleError: () => {},
    fatalError: () => {},
    call: async () => undefined as any,
    tracer: {
      options: options.tracing || {},
    } as any,
  } as unknown as FakeRuntime;

  return fakeRuntime;
};
