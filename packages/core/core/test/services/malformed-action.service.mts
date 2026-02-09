import type { Context } from "../../types/index.js";

export default {
  name: "malformed-action",
  actions: {
    timeout: [
      {
        handler: {
          doIt(_context: Context) {},
        },
      },
    ],
  },
};
