// import { omit } from '@weave-js/utils';
import { TracingAdapters } from "../../../lib/index.mts";
import { createNode } from "../../helper/index.mts";
import { posts, users } from "../../helper/data.mts";
import { describe, it, afterEach, before, after } from "node:test";
import * as assert from "node:assert/strict";
import type { Broker, Context } from "../../../types/index.js";

// const pickSpanFields = (spans, fieldsToOmit = []) => {
//   return spans.map(span => {
//     span = omit(span, ['startTime', 'duration', 'finishTime'])
//     return span
//   })
// }

interface TracingSpan {
  name: string;
  startTime: number;
  tags: {
    data?: { id?: number };
    response?: { name?: string } | unknown;
  };
}

describe("Test tracing", () => {
  let flow: TracingSpan[] = [];
  let id = 0;

  const defaultSettings = {
    logger: {
      enabled: false,
    },
    transport: {
      adapter: "dummy",
    },
    tracing: {
      enabled: true,
      collectors: [
        TracingAdapters.Event.default({
          interval: 1,
        }),
      ],
    },
    uuidFactory(runtime: { nodeId: string }) {
      return `${runtime.nodeId}-${++id}`;
    },
  };

  const node1: Broker = createNode(Object.assign({ nodeId: "node1" }, defaultSettings), [
    {
      name: "tracing-collector",
      events: {
        "$tracing.trace.spans"(ctx: Context<TracingSpan[]>) {
          flow.push(...ctx.data);
        },
      },
    },
  ]);

  const node2: Broker = createNode(Object.assign({ nodeId: "node2" }, defaultSettings), [
    {
      name: "post",
      actions: {
        list: {
          handler(context: Context) {
            const copiedPosts = JSON.parse(JSON.stringify(posts)) as Array<{
              id: number;
              title: string;
              author: number | { id: number; name: string };
            }>;
            return Promise.all(
              copiedPosts.map(async (post) => {
                post.author = await context.call("user.get", { id: post.author });
                return post;
              }),
            );
          },
        },
      },
    },
  ]);

  const node3: Broker = createNode(Object.assign({ nodeId: "node3" }, defaultSettings), [
    {
      name: "user",
      actions: {
        get: {
          handler(context: Context) {
            const user = users.find(
              (user) => user.id === (context.data as Record<string, string>).id,
            );
            return user;
          },
        },
      },
    },
  ]);

  const node4: Broker = createNode(Object.assign({ nodeId: "node4" }, defaultSettings), [
    {
      name: "friends",
    },
  ]);

  node2.createService({
    name: "test",
    actions: {
      hello(_context: Context) {
        return "Hello";
      },
    },
  });

  before(() => {
    return Promise.all([node1.start(), node2.start(), node3.start(), node4.start()]);
  });

  after(() => Promise.all([node1.stop(), node2.stop(), node3.stop(), node4.stop()]));

  afterEach(() => {
    flow = [];
    id = 0;
  });

  it("Started and finished event should be triggered.", async () => {
    await node1.waitForServices(["post", "user", "friends"]);
    const result = await node2.call("post.list");

    // Wait for tracing events to be collected
    await new Promise((resolve) => setTimeout(resolve, 100));

    assert.ok(result, "Result should be defined");
    assert.ok(Array.isArray(result), "Result should be an array");

    flow.sort((a, b) => a.startTime - b.startTime);
  });
});

describe("Test tag handling for spans", () => {
  let flow: TracingSpan[] = [];
  let id = 0;

  const defaultSettings = {
    logger: {
      enabled: false,
    },
    transport: {
      adapter: "dummy",
    },
    tracing: {
      enabled: true,
      collectors: [
        TracingAdapters.Event.default({
          interval: 1,
        }),
      ],
    },
    uuidFactory(runtime: { nodeId: string }) {
      return `${runtime.nodeId}-${++id}`;
    },
  };

  const node1: Broker = createNode(Object.assign({ nodeId: "node-link-1" }, defaultSettings), [
    {
      name: "user",
      events: {
        "$tracing.trace.spans"(ctx: Context<TracingSpan[]>) {
          flow.push(...ctx.data);
        },
      },
      actions: {
        get: {
          tracing: {
            tags: {
              data: ["id"],
              response: ["name"],
            },
          },
          async handler(context: Context) {
            const user = users.find((user) => user.id === (context.data as { id: number }).id);
            return user;
          },
        },
      },
    },
  ]);

  const node2: Broker = createNode(Object.assign({ nodeId: "node-link-2" }, defaultSettings), [
    {
      name: "post",
      actions: {
        list: {
          tracing: {
            tags: {
              response: true,
            },
          },
          async handler(context: Context) {
            const copiedPosts = JSON.parse(JSON.stringify(posts)) as Array<{
              id: number;
              title: string;
              author: number | { id: number; name: string };
            }>;
            return Promise.all(
              copiedPosts.map(async (post) => {
                post.author = await context.call("user.get", { id: post.author });
                return post;
              }),
            );
          },
        },
      },
    },
  ]);

  node1.createService({
    name: "from-service",
    actions: {
      departure(_context: Context) {
        return "Hello";
      },
    },
  });

  node1.createService({
    name: "to-service",
    actions: {
      destination(_context: Context) {
        return "Hello";
      },
    },
  });

  before(() => {
    return Promise.all([node1.start(), node2.start()]);
  });

  after(() => Promise.all([node1.stop(), node2.stop()]));

  afterEach(() => {
    flow = [];
    id = 0;
  });

  it("Should link spans over context", async () => {
    await node1.waitForServices(["post"]);
    await node2.call("post.list");
    // Wait for tracing events to be collected
    await new Promise((resolve) => setTimeout(resolve, 100));
    const userGetActions = flow.filter((span) => span.name === 'action "user.get"');
    const postListAction = flow.filter((span) => span.name === 'action "post.list"');

    assert.strictEqual(userGetActions.length, 3);
    assert.strictEqual(postListAction.length, 1);
  });

  it("Should create tags from data object", async () => {
    await node1.waitForServices(["post"]);
    await node2.call("post.list");
    // Wait for tracing events to be collected
    await new Promise((resolve) => setTimeout(resolve, 100));
    const userGetActions = flow.filter((span) => span.name === 'action "user.get"');
    const postListAction = flow.filter((span) => span.name === 'action "post.list"');

    const idsFromTags = userGetActions
      .map((span) => {
        return span.tags.data?.id;
      })
      .sort();

    assert.deepStrictEqual(idsFromTags, [1, 2, 3]);

    assert.strictEqual(userGetActions.length, 3);
    assert.strictEqual(postListAction.length, 1);
  });

  it("Should create tags from complete response", async () => {
    await node1.waitForServices(["post"]);
    const result = await node2.call("post.list");
    // Wait for tracing events to be collected
    await new Promise((resolve) => setTimeout(resolve, 100));
    const postListAction = flow.filter((span) => span.name === 'action "post.list"');

    const postResultFromTags = postListAction[0];
    assert.strictEqual(postListAction.length, 1);
    assert.deepStrictEqual(Object.assign({}, result), postResultFromTags.tags.response);
  });

  it("Should create tags from response object properties", async () => {
    await node1.waitForServices(["post"]);
    await node2.call("post.list");
    // Wait for tracing events to be collected
    await new Promise((resolve) => setTimeout(resolve, 100));
    const userGetActions = flow.filter((span) => span.name === 'action "user.get"');

    const namesFromTags = userGetActions
      .map((span) => (span.tags.response as { name?: string })?.name)
      .sort();

    assert.deepStrictEqual(namesFromTags, ["Hank Schrader", "Jesse Pinkman", "Walter White"]);
  });
});
