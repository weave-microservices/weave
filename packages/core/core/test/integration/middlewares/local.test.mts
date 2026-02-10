import { createNode } from "../../helper/index.mts";
import { describe, it } from "node:test";
import assert from "node:assert/strict";
import type { Runtime, Service, Middleware, ActionHandler, ParsedAction } from "../../../types/index.js";

const createMiddlewareWithFlow = (flowArray: string[]): Middleware => {
  return {
    created(_runtime?: Runtime) {
      flowArray.push("created");
    },
    starting(_runtime?: Runtime) {
      flowArray.push("starting");
    },
    started(_runtime?: Runtime) {
      flowArray.push("started");
    },
    serviceStarting(service: Service) {
      flowArray.push("serviceStarting:" + service.name);
    },
    serviceStarted(service: Service) {
      flowArray.push("serviceStarted:" + service.name);
    },
    serviceStopping(service: Service) {
      flowArray.push("serviceStopping:" + service.name);
    },
    serviceStopped(_service: Service) {
      flowArray.push("serviceStopped");
    },
    localAction(handler: ActionHandler, action: ParsedAction) {
      flowArray.push("localAction:" + action.name);
      return handler;
    },
    remoteAction(handler: ActionHandler, _action: ParsedAction) {
      flowArray.push("remoteAction");
      return handler;
    },
    emit(next: Function) {
      flowArray.push("emit");
      return function (this: unknown, ...args: unknown[]) {
        return next.apply(this, args);
      };
    },
    broadcast(next: Function) {
      flowArray.push("broadcast");
      return function (this: unknown, ...args: unknown[]) {
        return next.apply(this, args);
      };
    },
    broadcastLocal(next: Function) {
      flowArray.push("broadcastLocal");
      return function (this: unknown, ...args: unknown[]) {
        return next.apply(this, args);
      };
    },
    call(next: Function) {
      flowArray.push("call");
      return function (this: unknown, ...args: unknown[]) {
        return next.apply(this, args);
      };
    },
    multiCall(next: Function) {
      flowArray.push("multiCall");
      return function (this: unknown, ...args: unknown[]) {
        return next.apply(this, args);
      };
    },
    createService(next: Function) {
      flowArray.push("createService");
      return function (this: unknown, ...args: unknown[]) {
        return next.apply(this, args);
      };
    },
    loadService(next: Function) {
      flowArray.push("loadService");
      return function (this: unknown, ...args: unknown[]) {
        return next.apply(this, args);
      };
    },
    loadServices(next: Function) {
      flowArray.push("loadServices");
      return function (this: unknown, ...args: unknown[]) {
        return next.apply(this, args);
      };
    },
  };
};

describe("Test middlewares", () => {
  it("should fire middleware hooks in always the same order", async () => {
    const flow: string[] = [];
    const broker = createNode({
      middlewares: [createMiddlewareWithFlow(flow)],
    });

    await broker.start();
    assert.strictEqual(
      flow.join("-"),
      "call-multiCall-emit-broadcast-broadcastLocal-createService-loadService-loadServices-created-starting-started",
    );
  });

  it("should decorate broker instance", async () => {
    const broker = createNode({
      nodeId: "node1",
      logger: {
        enabled: false,
      },
      middlewares: [
        {
          created(runtime?: Runtime & { getNodeId?: () => string }) {
            if (runtime) {
              runtime.getNodeId = () => {
                return `The node ID is "${runtime.nodeId}"`;
              };
            }
          },
        },
      ],
    });

    broker.createService({
      name: "testService",
      actions: {
        getId() {
          return (this.runtime as Runtime & { getNodeId: () => string }).getNodeId();
        },
      },
    });

    await broker.start();
    const result = await broker.call("testService.getId");
    assert.strictEqual(result, 'The node ID is "node1"');
  });
});
