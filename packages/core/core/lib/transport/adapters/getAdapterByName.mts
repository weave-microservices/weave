import adapters from "./adapters.mts";

export default (name) => {
  if (!name) {
    return;
  }
  const foundAdapterName = Object.keys(adapters).find(
    (adapter) => adapter.toLowerCase() === name.toLowerCase(),
  );
  if (foundAdapterName) {
    return adapters[foundAdapterName];
  }
};
