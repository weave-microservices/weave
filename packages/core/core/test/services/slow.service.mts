import type { Context } from "../../types/index.js";

export default {
  name: "slow",
  actions: {
    timeout: {
      handler(_context: Context) {
        return new Promise((resolve) => {
          setTimeout(() => {
            resolve("yes");
          }, 1000);
        });
      },
    },
  },
};
