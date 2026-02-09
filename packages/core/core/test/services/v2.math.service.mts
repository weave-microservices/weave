import type { Context } from "../../types/index.js";

export default {
  name: "math",
  version: 2,
  actions: {
    add: {
      cache: {
        keys: ["a", "b"],
      },
      params: {
        a: "number",
        b: "number",
      },
      handler(context: Context) {
        const data = context.data as { a: number; b: number };
        return Number(data.a) + Number(data.b);
      },
    },
    round: {
      cache: {
        keys: ["value"],
      },
      params: {
        value: "number",
      },
      handler(context: Context) {
        const data = context.data as { value: number };
        return Math.round(data.value);
      },
    },
  },
};
