import { createGauge } from "./gauge.mts";

export const createCounter = (metricRegistry, obj) => {
  const base = createGauge(metricRegistry, obj);

  base.decrement = () => {
    throw new Error("Not allowed to decrement a counter");
  };

  return base;
};
