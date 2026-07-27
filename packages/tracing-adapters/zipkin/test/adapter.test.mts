import { describe, it, beforeEach, afterEach } from "node:test";
import assert from "node:assert/strict";
import type { Runtime } from "@weave-js/core/types/index.js";
import { createZipkinExporter } from "../lib/index.mts";

interface FetchCall {
  url: string;
  options: RequestInit;
}

const defaultTracerOptions = {
  errors: {
    fields: ["name", "message", "code", "type", "data"],
  },
};

const createRuntimeMock = (
  tracerOptions: Record<string, unknown> = defaultTracerOptions,
): { runtime: Runtime; errors: unknown[] } => {
  const errors: unknown[] = [];

  const runtime = {
    log: {
      error: (error: unknown) => errors.push(error),
    },
    tracer: {
      options: tracerOptions,
    },
  } as unknown as Runtime;

  return { runtime, errors };
};

const createSpan = (overrides: Record<string, unknown> = {}) => ({
  id: "aaaaaaaa-bbbb-cccc-dddd-eeeeeeeeeeee",
  traceId: "11111111-2222-3333-4444-555555555555",
  parentId: "99999999-8888-7777-6666-555555555555",
  name: "action 'test.hello'",
  type: "action",
  startTime: 1000.5,
  finishTime: 1002.5,
  duration: 2,
  tags: { nodeId: "node1", nested: { value: 42 } },
  service: { fullyQualifiedName: "testService" },
  ...overrides,
});

/** Waits until the exporter had a chance to flush its queue. */
const waitForFlush = () => new Promise((resolve) => setTimeout(resolve, 50));

const parseBody = (call: FetchCall) => JSON.parse(call.options.body as string);

describe("Zipkin trace exporter", () => {
  const originalFetch = globalThis.fetch;
  const originalZipkinUrl = process.env.ZIPKIN_URL;
  let fetchCalls: FetchCall[];

  beforeEach(() => {
    fetchCalls = [];
    delete process.env.ZIPKIN_URL;
    globalThis.fetch = (async (url: string, options: RequestInit) => {
      fetchCalls.push({ url, options });
      return { text: async () => "" };
    }) as unknown as typeof fetch;
  });

  afterEach(() => {
    globalThis.fetch = originalFetch;

    if (originalZipkinUrl === undefined) {
      delete process.env.ZIPKIN_URL;
    } else {
      process.env.ZIPKIN_URL = originalZipkinUrl;
    }
  });

  describe("options", () => {
    it("should create a collector with default options", () => {
      const { runtime } = createRuntimeMock();
      const exporter = createZipkinExporter()(runtime);

      assert.equal(typeof exporter.finishedSpan, "function");
      assert.equal(typeof exporter.stop, "function");

      exporter.stop();
    });

    it("should send to the default host if no host is configured", async () => {
      const { runtime } = createRuntimeMock();
      const exporter = createZipkinExporter({ interval: 10 })(runtime);

      exporter.finishedSpan(createSpan());

      await waitForFlush();
      await exporter.stop();

      assert.equal(fetchCalls[0].url, "http://localhost:9411/api/v2/spans");
    });

    it("should use the ZIPKIN_URL environment variable as default host", async () => {
      process.env.ZIPKIN_URL = "http://zipkin-from-env:9411";

      const { runtime } = createRuntimeMock();
      const exporter = createZipkinExporter({ interval: 10 })(runtime);

      exporter.finishedSpan(createSpan());

      await waitForFlush();
      await exporter.stop();

      assert.equal(fetchCalls[0].url, "http://zipkin-from-env:9411/api/v2/spans");
    });

    it("should prefer explicit options over the ZIPKIN_URL environment variable", async () => {
      process.env.ZIPKIN_URL = "http://zipkin-from-env:9411";

      const { runtime } = createRuntimeMock();
      const exporter = createZipkinExporter({
        host: "http://explicit-host:9411",
        endpoint: "/custom/spans",
        interval: 10,
      })(runtime);

      exporter.finishedSpan(createSpan());

      await waitForFlush();
      await exporter.stop();

      assert.equal(fetchCalls[0].url, "http://explicit-host:9411/custom/spans");
    });
  });

  describe("payload generation", () => {
    it("should flush queued spans to the configured zipkin endpoint", async () => {
      const { runtime } = createRuntimeMock();
      const exporter = createZipkinExporter({
        host: "http://zipkin.local:9411",
        endpoint: "/api/v2/spans",
        interval: 10,
      })(runtime);

      exporter.finishedSpan(createSpan());

      await waitForFlush();
      await exporter.stop();

      assert.equal(fetchCalls.length, 1);

      const call = fetchCalls[0];
      assert.equal(call.url, "http://zipkin.local:9411/api/v2/spans");
      assert.equal(call.options.method, "post");

      const headers = call.options.headers as Record<string, string>;
      assert.equal(headers["Content-Type"], "application/json");
      assert.equal(
        headers["Content-Length"],
        String(Buffer.byteLength(call.options.body as string)),
      );

      const [payload] = parseBody(call);

      assert.equal(payload.id, "aaaaaaaabbbbcccc");
      assert.equal(payload.traceId, "1111111122223333");
      assert.equal(payload.parentId, "9999999988887777");
      assert.equal(payload.name, "action 'test.hello'");
      assert.equal(payload.kind, "SERVER");
      assert.equal(payload.localEndpoint.serviceName, "testService");
      assert.equal(payload.remoteEndpoint.serviceName, "testService");
      assert.equal(payload.timestamp, 1000500);
      assert.equal(payload.duration, 2000);
      assert.equal(payload.tags.service, "testService");
      assert.equal(payload.tags["span.type"], "action");
      assert.equal(payload.tags.nodeId, "node1");
      assert.equal(payload.tags["nested.value"], "42");
      assert.deepEqual(
        payload.annotations.map((annotation: { value: string }) => annotation.value),
        ["sr", "ss"],
      );
      assert.deepEqual(
        payload.annotations.map((annotation: { timestamp: number }) => annotation.timestamp),
        [1000500, 1002500],
      );
    });

    it("should map missing optional span fields to null", async () => {
      const { runtime } = createRuntimeMock();
      const exporter = createZipkinExporter({ interval: 10 })(runtime);

      exporter.finishedSpan({ id: "aaaaaaaa-bbbb-cccc-dddd-eeeeeeeeeeee" });

      await waitForFlush();
      await exporter.stop();

      const [payload] = parseBody(fetchCalls[0]);

      assert.equal(payload.traceId, null);
      assert.equal(payload.parentId, null);
      assert.equal(payload.timestamp, null);
      assert.equal(payload.duration, null);
      assert.equal(payload.localEndpoint.serviceName, null);
      assert.equal(payload.remoteEndpoint.serviceName, null);
      assert.equal(payload.tags.service, null);
      assert.deepEqual(
        payload.annotations.map((annotation: { timestamp: number | null }) => annotation.timestamp),
        [null, null],
      );
    });

    it("should batch all queued spans into a single request and clear the queue", async () => {
      const { runtime } = createRuntimeMock();
      const exporter = createZipkinExporter({ interval: 10 })(runtime);

      exporter.finishedSpan(createSpan({ id: "11111111-1111-1111-1111-111111111111" }));
      exporter.finishedSpan(createSpan({ id: "22222222-2222-2222-2222-222222222222" }));

      await waitForFlush();

      assert.equal(fetchCalls.length, 1);

      const payloads = parseBody(fetchCalls[0]);
      assert.equal(payloads.length, 2);
      assert.deepEqual(
        payloads.map((payload: { id: string }) => payload.id),
        ["1111111111111111", "2222222222222222"],
      );

      // the queue is empty now - no further requests on the next interval
      await waitForFlush();
      await exporter.stop();

      assert.equal(fetchCalls.length, 1);
    });

    it("should not send anything if the queue is empty", async () => {
      const { runtime } = createRuntimeMock();
      const exporter = createZipkinExporter({ interval: 10 })(runtime);

      await waitForFlush();
      await exporter.stop();

      assert.equal(fetchCalls.length, 0);
    });
  });

  describe("error handling", () => {
    it("should add error tags and an error annotation for failed spans", async () => {
      const { runtime } = createRuntimeMock();
      const exporter = createZipkinExporter({ interval: 10 })(runtime);

      exporter.finishedSpan(createSpan({ error: new Error("Something went wrong") }));

      await waitForFlush();
      await exporter.stop();

      const [payload] = parseBody(fetchCalls[0]);

      assert.equal(payload.tags.error, "Something went wrong");
      assert.equal(payload.tags["error.message"], "Something went wrong");
      assert.equal(payload.tags["error.name"], "Error");

      const errorAnnotation = payload.annotations.find(
        (annotation: { value: string }) => annotation.value === "error",
      );

      assert.ok(errorAnnotation);
      assert.equal(errorAnnotation.timestamp, 1002500);
      assert.equal(errorAnnotation.endpoint.serviceName, "testService");
      assert.equal(errorAnnotation.endpoint.ipv4, "");
      assert.equal(errorAnnotation.endpoint.port, 0);
    });

    it("should work if the tracer does not define error fields", async () => {
      const { runtime } = createRuntimeMock({});
      const exporter = createZipkinExporter({ interval: 10 })(runtime);

      exporter.finishedSpan(createSpan({ error: new Error("Something went wrong") }));

      await waitForFlush();
      await exporter.stop();

      const [payload] = parseBody(fetchCalls[0]);

      assert.equal(payload.tags.error, "Something went wrong");
      assert.equal(payload.tags["error.message"], undefined);
    });

    it("should log transport errors on the runtime logger", async () => {
      const { runtime, errors } = createRuntimeMock();

      globalThis.fetch = (async () => {
        throw new Error("Connection refused");
      }) as unknown as typeof fetch;

      const exporter = createZipkinExporter({ interval: 10 })(runtime);

      exporter.finishedSpan(createSpan());

      await waitForFlush();
      await exporter.stop();

      assert.equal(errors.length, 1);
      assert.equal((errors[0] as Error).message, "Connection refused");
    });
  });

  describe("lifecycle", () => {
    it("should stop the flush timer", async () => {
      const { runtime } = createRuntimeMock();
      const exporter = createZipkinExporter({ interval: 10 })(runtime);

      await exporter.stop();

      exporter.finishedSpan(createSpan());

      await waitForFlush();

      assert.equal(fetchCalls.length, 0);
    });

    it("should tolerate being stopped twice", async () => {
      const { runtime } = createRuntimeMock();
      const exporter = createZipkinExporter({ interval: 10 })(runtime);

      await exporter.stop();
      await exporter.stop();

      assert.equal(fetchCalls.length, 0);
    });
  });
});
