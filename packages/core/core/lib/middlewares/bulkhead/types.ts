/*
 * Author: Kevin Ries (kevin.ries@fachwerk.io)
 * -----
 * Copyright 2021 Fachwerk
 */

import type { Context, ServiceInjection } from "../../../types/index.js";

export interface BulkheadQueueItem {
  resolve: (value: unknown) => void;
  reject: (reason: unknown) => void;
  context: Context;
  serviceInjections: ServiceInjection;
}
