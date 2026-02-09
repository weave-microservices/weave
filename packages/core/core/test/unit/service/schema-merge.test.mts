import { mergeSchemas } from "../../../lib/utils/options.mts";
import { describe, it, mock } from "node:test";
import assert from "node:assert/strict";
import type { Context, ServiceSchema, ServiceEvent, ServiceLifecycleHook, ServiceAfterSchemasMergedHook } from "../../../types/index.js";

class TestClass {
  send(): () => void {
    return mock.fn();
  }
}

const mixin: ServiceSchema = {
  name: "service2",
  meta: {
    $official: true,
    distributor: "name",
  },
  settings: {
    queueSize: 6,
    protocol: "http",
    credentials: {
      username: "default",
      password: "default",
    },
  },

  actions: {
    m2() {},
    m3() {},
  },
  events: {
    me1() {},
    me2() {},
  },
  created: mock.fn() as unknown as ServiceLifecycleHook,
  started: mock.fn() as unknown as ServiceLifecycleHook,
};

const service1: ServiceSchema = {
  name: "service1",
  meta: {
    $official: true,
    packageName: "test",
  },
  settings: {
    queueSize: 4,
    protocol: "https",
    credentials: {
      username: "John",
    },
    prototype: new TestClass(),
  },
  hooks: {
    before: {
      a1: (_context: Context) => _context,
    },
    after: {
      a3: (_context: Context, response: unknown) => response,
    },
  },
  actions: {
    a1() {},
    a3: false,
  },
  events: {
    e1() {},
  },
  methods: {
    privateMethod1() {},
  },
  afterSchemasMerged: mock.fn() as unknown as ServiceAfterSchemasMergedHook,
  created: mock.fn() as unknown as ServiceLifecycleHook,
  started: mock.fn() as unknown as ServiceLifecycleHook,
  stopped: mock.fn() as unknown as ServiceLifecycleHook,
};

const service2: ServiceSchema & { adapter: TestClass } = {
  name: "service2",
  mixins: [mixin],
  meta: {
    $official: true,
    distributor: "name",
  },
  adapter: new TestClass(),
  settings: {
    queueSize: 6,
    protocol: "http",
    credentials: {
      username: "default",
      password: "default",
    },
  },
  hooks: {
    before: {
      a2: (_context: Context) => _context,
    },
    after: {
      a3: [
        (_context: Context, response: unknown) => response,
        (_context: Context, response: unknown) => response,
      ] as unknown as ((context: Context, response: unknown) => unknown),
    },
  },
  actions: {
    a2() {},
    a3() {},
  },
  events: {
    e1() {},
    e2() {},
  },
  afterSchemasMerged: mock.fn() as unknown as ServiceAfterSchemasMergedHook,
  created: mock.fn() as unknown as ServiceLifecycleHook,
  started: mock.fn() as unknown as ServiceLifecycleHook,
};

describe("Service schema merging", () => {
  it("shoud override the name", () => {
    const mergedService = mergeSchemas(service2, service1);
    assert.strictEqual(mergedService.name, "service1");
  });

  it("shoud merge lifecycle hooks", () => {
    const mergedService = mergeSchemas(service2, service1);
    assert.ok(Array.isArray(mergedService.created));
    assert.ok(Array.isArray(mergedService.started));
    assert.ok(Array.isArray(mergedService.stopped));
    assert.strictEqual((mergedService.afterSchemasMerged as unknown[]).length, 2);
    assert.strictEqual((mergedService.created as unknown[]).length, 2);
    assert.strictEqual((mergedService.started as unknown[]).length, 2);
    assert.strictEqual((mergedService.stopped as unknown[]).length, 1);
  });

  it("shoud merge settings", () => {
    const mergedService = mergeSchemas(service2, service1);
    assert.ok(Array.isArray(mergedService.started));
    assert.strictEqual((mergedService.started as unknown[]).length, 2);
  });

  it("shoud merge settings", () => {
    const mergedService = mergeSchemas(service2, service1);
    assert.strictEqual(mergedService.settings!.queueSize, 4);
    assert.strictEqual((mergedService.started as unknown[]).length, 2);
  });

  it("shoud merge meta", () => {
    const mergedService = mergeSchemas(service2, service1);
    assert.strictEqual(mergedService.meta!.$official, true);
    assert.strictEqual(mergedService.meta!.distributor, "name");
    assert.strictEqual(mergedService.meta!.packageName, "test");
  });

  it("shoud merge actions", () => {
    const mergedService = mergeSchemas(service2, service1);
    assert.notStrictEqual(mergedService.actions, undefined);
    assert.notStrictEqual(mergedService.actions!.a1, undefined);
    assert.notStrictEqual(mergedService.actions!.a2, undefined);
    assert.strictEqual(mergedService.actions!.a3, undefined);
  });

  it("shoud merge events", () => {
    const mergedService = mergeSchemas(service2, service1);
    assert.notStrictEqual(mergedService.actions, undefined);
    assert.notStrictEqual(mergedService.events!.e1, undefined);
    assert.ok(Array.isArray((mergedService.events!.e1 as ServiceEvent).handler));
    assert.notStrictEqual(mergedService.events!.e2, undefined);
  });

  it("shoud merge methods", () => {
    const mergedService = mergeSchemas(service2, service1);
    assert.notStrictEqual(mergedService.methods, undefined);
    assert.notStrictEqual(mergedService.methods!.privateMethod1, undefined);
  });
});

describe("Hooks", () => {
  it("should merge schema hooks", () => {
    const mergedService = mergeSchemas(service2, service1);
    assert.notStrictEqual(mergedService.hooks!.before, undefined);
    assert.notStrictEqual(mergedService.hooks!.before!.a1, undefined);
    assert.notStrictEqual(mergedService.hooks!.before!.a2, undefined);
    assert.notStrictEqual(mergedService.hooks!.after!.a3, undefined);
    assert.strictEqual((mergedService.hooks!.after!.a3 as unknown as unknown[]).length, 3);
    assert.notStrictEqual(mergedService.settings!.prototype.send, undefined);
    assert.strictEqual(typeof mergedService.settings!.prototype.send, "function");
  });
});

describe("dependencies", () => {
  it("should merge dependencies", () => {
    const depService1: ServiceSchema = {
      name: "name1",
      dependencies: ["service3", "service2"],
    };

    const depService2: ServiceSchema = {
      name: "name2",
      dependencies: ["service1", "service3"],
    };

    const depService3: ServiceSchema = {
      name: "name3",
      dependencies: ["service1", "service2"],
    };

    const mergedSchema = mergeSchemas(depService1, mergeSchemas(depService3, depService2));
    assert.strictEqual(mergedSchema.dependencies!.length, 6);
  });
});
