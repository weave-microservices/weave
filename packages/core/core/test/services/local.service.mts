import { WeaveError } from "../../lib/errors.mts";
import type { Context } from "../../types/index.js";

export default {
  name: "local",
  actions: {
    hidden: {
      visibility: "protected",
      params: {
        text: "string",
      },
      handler(context: Context) {
        const data = context.data as { text: string };
        return data.text.split("").reverse().join("");
      },
    },
    faulty: {
      handler() {
        throw new Error("Missing Data...");
      },
    },
    faultyWeave: {
      handler() {
        throw new WeaveError("Missing Data...", {
          data: {
            name: "Missing",
          },
        });
      },
    },
  },
};
