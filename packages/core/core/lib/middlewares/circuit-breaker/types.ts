/*
 * Author: Kevin Ries (kevin.ries@fachwerk.io)
 * -----
 * Copyright 2021 Fachwerk
 */

import type { CircuitBreakerOptions, Endpoint } from "../../../types/index.js";
import {
  CIRCUIT_CLOSED,
  CIRCUIT_HALF_OPENED,
  CIRCUIT_HALF_OPEN_WAITING,
  CIRCUIT_OPENED,
} from "../../constants.mts";

export type CircuitState =
  | typeof CIRCUIT_CLOSED
  | typeof CIRCUIT_HALF_OPENED
  | typeof CIRCUIT_HALF_OPEN_WAITING
  | typeof CIRCUIT_OPENED;

export interface CircuitBreakerEndpointState {
  endpoint: Endpoint;
  options: CircuitBreakerOptions;
  callCounter: number;
  failureCouter: number;
  state: CircuitState;
  circuitBreakerTimer: ReturnType<typeof setTimeout> | null;
}
