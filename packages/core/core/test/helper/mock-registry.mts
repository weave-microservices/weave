import { createFakeRuntime } from "./runtime.mts";

export const createMockRegistry = (options = { runtimeOptions: {} }) => {
  const runtime = createFakeRuntime(options.runtimeOptions);

  return {
    runtime,
  };
};
