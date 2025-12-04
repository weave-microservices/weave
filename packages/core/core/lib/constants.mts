/*
 * Author: Kevin Ries (kevin.ries@fachwerk.io)
 * -----
 * Copyright 2021 Fachwerk
 */

export const PROTOCOL_VERSION = 1;

export const loadBalancingStrategy = {
  ROUND_ROBIN: "round_robin",
  RANDOM: "random",
};

export const CIRCUIT_CLOSED = "closed";
export const CIRCUIT_HALF_OPENED = "half_opened";
export const CIRCUIT_HALF_OPEN_WAITING = "half_open_waiting";
export const CIRCUIT_OPENED = "opened";

export const circuitBreakerStates = {
  CIRCUIT_CLOSED,
  CIRCUIT_HALF_OPENED,
  CIRCUIT_HALF_OPEN_WAITING,
  CIRCUIT_OPENED,
};

export const level = {
  trace: "trace",
  debug: "debug",
  info: "info",
  warn: "warn",
  error: "error",
  fatal: "fatal",
};
