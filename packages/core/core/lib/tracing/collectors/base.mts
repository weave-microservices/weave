import { isObject, pick } from "@weave-js/utils";
import type { Runtime, Span, Tracer, TracingOptions } from "../../../types/index.js";

/**
 * Span data with optional error field
 */
interface SpanData extends Partial<Span> {
  error?: Error | Record<string, unknown>;
}

/**
 * Tracing collector interface
 */
export interface TracingCollector {
  runtime: Runtime;
  tracer?: Tracer;
  options: TracingOptions;
  init: (runtime: Runtime, tracer?: Tracer) => void;
  startedSpan: (span: SpanData) => void;
  finishedSpan: (span: SpanData) => void;
  stop: () => Promise<void>;
  flattenTags: (
    obj: Record<string, unknown> | null,
    convertToString?: boolean,
    path?: string,
  ) => Record<string, unknown> | null;
  getErrorFields: (error: Error | null, fields: string[]) => Record<string, unknown> | null;
}

/**
 * Create a base tracing collector
 * @param {Runtime} runtime
 * @returns {TracingCollector}
 */
export const createBaseTracingCollector = (runtime: Runtime): TracingCollector => {
  const baseTracingCollector: TracingCollector = Object.create(null);

  baseTracingCollector.options = runtime.tracer!.options;

  baseTracingCollector.init = (runtime: Runtime): void => {
    baseTracingCollector.runtime = runtime;
    baseTracingCollector.tracer = runtime.tracer;
  };

  baseTracingCollector.startedSpan = (): void => {
    // throw new WeaveError('not implemented.')
  };

  baseTracingCollector.finishedSpan = (): void => {
    // throw new WeaveError('not implemented.')
  };

  baseTracingCollector.stop = async (): Promise<void> => {
    // throw new WeaveError('not implemented.')
  };

  /**
   * Flatten an object.
   * @param {Record<string, unknown> | null} obj Object
   * @param {boolean} convertToString
   * @param {string} path
   * @returns {Record<string, unknown> | null}
   */
  baseTracingCollector.flattenTags = (
    obj: Record<string, unknown> | null,
    convertToString = false,
    path = "",
  ): Record<string, unknown> | null => {
    if (!obj) {
      return null;
    }

    return Object.keys(obj).reduce((res: Record<string, unknown>, k: string) => {
      const o = obj[k];
      const pp = (path ? path + "." : "") + k;

      if (isObject(o)) {
        Object.assign(
          res,
          baseTracingCollector.flattenTags(o as Record<string, unknown>, convertToString, pp),
        );
      } else if (o !== undefined) {
        res[pp] = convertToString ? String(o) : o;
      }

      return res;
    }, {});
  };

  /**
   * Get fields of an error object.
   * @param {Error | null} error Error
   * @param {string[]} fields
   * @returns {Record<string, unknown> | null}
   */
  baseTracingCollector.getErrorFields = (
    error: Error | null,
    fields: string[],
  ): Record<string, unknown> | null => {
    if (!error) {
      return null;
    }
    return pick(error, fields);
  };

  return baseTracingCollector;
};
