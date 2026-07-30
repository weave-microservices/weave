const Strategies = {
  Random: await import("./random.mts"),
  RoundRobin: await import("./round-robin.mts"),
} as const;

type StrategyName = keyof typeof Strategies;

const getByName = (name: string): (typeof Strategies)[StrategyName] | null => {
  if (!name) {
    return null;
  }

  const n = Object.keys(Strategies).find(
    (strategyName) => strategyName.toLowerCase() === name.toLowerCase(),
  ) as StrategyName | undefined;
  if (n) {
    return Strategies[n];
  }
  return null;
};

export default {
  resolve(option: string): (typeof Strategies)[StrategyName] | null | undefined {
    if (typeof option === "string") {
      return getByName(option);
    }
  },
};
