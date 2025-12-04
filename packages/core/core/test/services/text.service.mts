import { it } from "node:test";
export default {
  name: "text",
  actions: {
    reverse: {
      params: {
        text: "string",
      },
      handler(context) {
        return context.text.split("").reverse();
      },
    },
  },
};
