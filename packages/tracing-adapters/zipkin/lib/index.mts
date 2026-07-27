/*
 * Author: Kevin Ries (kevin.ries@fachwerk.io)
 * -----
 * Copyright 2021 Fachwerk
 */

import { createBaseTracingCollector } from "@weave-js/core/lib/tracing/collectors/base.mts";
import type { Runtime } from "@weave-js/core/types/index.js";

/**
 * Zipkin collector options
 */
export interface ZipkinCollectorOptions {
  /** Zipkin host */
  host?: string;
  /** Zipkin endpoint */
  endpoint?: string;
  /** Push interval in milliseconds */
  interval?: number;
}

/**
 * Span data consumed by the Zipkin exporter.
 */
interface ZipkinSpan {
  id?: string;
  traceId?: string;
  parentId?: string;
  name?: string;
  type?: string;
  startTime?: number;
  finishTime?: number;
  duration?: number;
  tags?: Record<string, unknown>;
  service?: { fullyQualifiedName: string } | null;
  error?: unknown;
}

interface ZipkinAnnotation {
  timestamp: number | null;
  value: string;
  endpoint?: {
    serviceName: string | null;
    ipv4: string;
    port: number;
  };
}

interface ZipkinPayload {
  id: string | null;
  traceId: string | null;
  parentId: string | null;
  name?: string;
  kind: string;
  localEndpoint: { serviceName: string | null };
  remoteEndpoint: { serviceName: string | null };
  timestamp: number | null;
  duration: number | null;
  annotations: ZipkinAnnotation[];
  tags: Record<string, unknown>;
}

const convertTime = (timestamp?: number | null): number | null =>
  timestamp != null ? Math.round(timestamp * 1000) : null;

const convertId = (id?: string | null): string | null =>
  id ? id.replace(/-/g, "").substring(0, 16) : null;

const mergeDefaultOptions = (options: ZipkinCollectorOptions): Required<ZipkinCollectorOptions> => {
  return Object.assign(
    {
      host: process.env.ZIPKIN_URL || "http://localhost:9411",
      endpoint: "/api/v2/spans",
      interval: 5000,
    },
    options,
  );
};

/**
 * Create a Zipkin collector adapter instance.
 * @param {ZipkinCollectorOptions} [options] Zipkin collector adapter options
 * @returns {(runtime: Runtime) => TracingCollector} Collector factory
 */
export const createZipkinExporter =
  (options: ZipkinCollectorOptions = {}) =>
  (runtime: Runtime) => {
    const exporter = createBaseTracingCollector(runtime);
    const queue: ZipkinSpan[] = [];

    const resolvedOptions = mergeDefaultOptions(options);

    let timer: NodeJS.Timeout | null = setInterval(() => flushQueue(), resolvedOptions.interval);
    timer.unref();

    const flushQueue = (): void => {
      if (queue.length) {
        const data = generatePayload();
        queue.length = 0;
        sendData(data);
      }
    };

    const generatePayload = (): ZipkinPayload[] => {
      return queue.map((span) => {
        const serviceName = span.service ? span.service.fullyQualifiedName : null;
        const error = (span.error ?? null) as Error | null;

        const payload: ZipkinPayload = {
          id: convertId(span.id),
          traceId: convertId(span.traceId),
          parentId: convertId(span.parentId),
          name: span.name,
          kind: "SERVER",
          localEndpoint: { serviceName },
          remoteEndpoint: { serviceName },
          timestamp: convertTime(span.startTime),
          duration: convertTime(span.duration),
          annotations: [
            {
              timestamp: convertTime(span.startTime),
              value: "sr",
            },
            {
              timestamp: convertTime(span.finishTime),
              value: "ss",
            },
          ],
          tags: {
            service: serviceName,
            "span.type": span.type,
          },
        };

        if (error) {
          payload.tags.error = error.message;
          payload.annotations.push({
            value: "error",
            endpoint: {
              serviceName: serviceName,
              ipv4: "",
              port: 0,
            },
            timestamp: convertTime(span.finishTime),
          });
        }

        Object.assign(
          payload.tags,
          exporter.flattenTags(span.tags ?? null, true),
          exporter.flattenTags(
            exporter.getErrorFields(error, exporter.options.errors?.fields ?? []),
            true,
            "error",
          ),
        );

        return payload;
      });
    };

    const sendData = (payloads: ZipkinPayload[]): void => {
      const data = JSON.stringify(payloads);

      fetch(`${resolvedOptions.host}${resolvedOptions.endpoint}`, {
        method: "post",
        body: data,
        headers: {
          "Content-Type": "application/json",
          "Content-Length": String(Buffer.byteLength(data)),
        },
      })
        .then((res) => res.text())
        .catch((error) => {
          runtime.log.error(error);
        });
    };

    exporter.finishedSpan = (span: ZipkinSpan): void => {
      queue.push(span);
    };

    exporter.stop = async (): Promise<void> => {
      if (timer) {
        clearInterval(timer);
        timer = null;
      }
    };

    return exporter;
  };
