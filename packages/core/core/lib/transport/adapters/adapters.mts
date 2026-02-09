/*
 * Author: Kevin Ries (kevin.ries@fachwerk.io)
 * -----
 * Copyright 2019 Fachwerk
 */

import BaseAdapter, { BaseTransportAdapter } from "./adapterBase.mts";
import Dummy from "./dummy/index.mts";
import TCP from "./tcp/index.mts";

// Export both legacy and new class-based API
export { BaseTransportAdapter };
export default { BaseAdapter, Dummy, TCP };
