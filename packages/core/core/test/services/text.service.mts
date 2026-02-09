import type { Context } from "../../types/index.js";

export default {
  name: "text",
  actions: {
    reverse: {
      params: {
        text: "string",
      },
      handler(context: Context) {
        const data = context.data as { text: string };
        return data.text.split("").reverse();
      },
    },
  },
};
