/*
 * Author: Kevin Ries (kevin.ries@fachwerk.io)
 * -----
 * Copyright 2021 Fachwerk
 */
import { Constants } from "../../metrics/index.mts";
import { getMiddlewareWrapper } from "./getMiddlewareWrapper.mts";
import type { ActionHandler, Middleware, Runtime, ParsedAction } from "../../../types/index.js";

export default (runtime: Runtime): Middleware => {
  const wrapMetricMiddleware = getMiddlewareWrapper(runtime);
  const metrics = runtime.metrics!;

  return {
    created(): void {
      // Request metrics
      metrics.register({
        type: "counter",
        name: Constants.REQUESTS_TOTAL,
        description: "Number of total requests.",
      });
      metrics.register({
        type: "gauge",
        name: Constants.REQUESTS_IN_FLIGHT,
        description: "Number of running requests.",
      });
      metrics.register({
        type: "counter",
        name: Constants.REQUESTS_ERRORS_TOTAL,
        description: "Number of failed requests.",
      });
      metrics.register({
        type: "gauge",
        name: Constants.REQUESTS_TIME,
        description: "Request times in milliseconds",
      });

      // Event metrics
      metrics.register({
        type: "counter",
        name: Constants.EVENT_TOTAL_EMITS,
        description: "Number of total emitted events.",
      });
      metrics.register({
        type: "counter",
        name: Constants.EVENT_TOTAL_BROADCASTS,
        description: "Number of total broadcasted events.",
      });
      metrics.register({
        type: "counter",
        name: Constants.EVENT_TOTAL_BROADCASTS_LOCAL,
        description: "Number of total local broadcasted events.",
      });
      metrics.register({
        type: "counter",
        name: Constants.EVENT_TOTAL_RECEIVED,
        description: "Number of total received events.",
      });

      // Transport metrics
      metrics.register({
        type: "gauge",
        name: Constants.TRANSPORT_IN_FLIGHT_STREAMS,
        description: "Number of in flight streams.",
      });
      metrics.register({
        type: "counter",
        name: Constants.TRANSPORTER_PACKETS_SENT,
        description: "Number of in flight streams.",
      });
      metrics.register({
        type: "counter",
        name: Constants.TRANSPORTER_PACKETS_RECEIVED,
        description: "Number of in flight streams.",
      });
      metrics.register({
        type: "gauge",
        name: Constants.TRANSPORT_IN_FLIGHT_STREAMS,
        description: "Number of in flight streams.",
      });
    },
    localAction(next: ActionHandler, action: ParsedAction): ActionHandler {
      return wrapMetricMiddleware("local", action, next);
    },
    remoteAction(next: ActionHandler, action: ParsedAction): ActionHandler {
      return wrapMetricMiddleware("remote", action, next);
    },
    emit(next: (event: string, payload: unknown) => void): (event: string, payload: unknown) => void {
      return (event: string, payload: unknown): void => {
        metrics.increment(Constants.EVENT_TOTAL_EMITS);
        return next(event, payload);
      };
    },
    broadcast(next: (event: string, payload: unknown) => void): (event: string, payload: unknown) => void {
      return (event: string, payload: unknown): void => {
        metrics.increment(Constants.EVENT_TOTAL_BROADCASTS);
        return next(event, payload);
      };
    },
    broadcastLocal(next: (event: string, payload: unknown) => void): (event: string, payload: unknown) => void {
      return (event: string, payload: unknown): void => {
        metrics.increment(Constants.EVENT_TOTAL_BROADCASTS_LOCAL);
        return next(event, payload);
      };
    },
  };
};
