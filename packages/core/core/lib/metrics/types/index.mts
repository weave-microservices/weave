const types = {
  Counter: (await import("./counter.mts")).createCounter,
  Gauge: (await import("./gauge.mts")).createGauge,
  Info: (await import("./info.mts")).createInfo,
};

const getByName = (name) => {
  const n = Object.keys(types).find((i) => i.toLocaleLowerCase() === name.toLocaleLowerCase());

  if (n) {
    return types[n];
  }
};

export default {
  resolve(type) {
    return getByName(type);
  },
};
