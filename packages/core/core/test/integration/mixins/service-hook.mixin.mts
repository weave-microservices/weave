import type { ServiceSchema } from "../../../types/index.js";

export default (rejectedMethodName?: string): Partial<ServiceSchema> => {
  const error = !rejectedMethodName ? null : new Error("Rejected hook from " + rejectedMethodName);
  return {
    created() {
      if (rejectedMethodName === "created") return Promise.reject(error);
    },
    started() {
      if (rejectedMethodName === "started") return Promise.reject(error);
    },
    stopped() {
      if (rejectedMethodName === "stopped") return Promise.reject(error);
    },
  };
};
