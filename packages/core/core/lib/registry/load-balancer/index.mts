const Strategies = {
  Random: await import("./random"),
  RoundRobin: await import("./round-robin"),
};
const getByName = (name) => {
  if (!name) {
    return null;
  }

  const n = Object.keys(Strategies).find((n) => n.toLowerCase() === name.toLowerCase());
  if (n) {
    return this.Cache[n];
  }
};

export default {
  resolve(option) {
    if (typeof option === "string") {
      return getByName(option);
    }
  },
};
