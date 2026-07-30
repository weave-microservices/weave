import adapters from "./adapters.mts";

type AdapterKey = keyof typeof adapters;

export default (name: string | undefined): (typeof adapters)[AdapterKey] | undefined => {
  if (!name) {
    return undefined;
  }
  const foundAdapterName = (Object.keys(adapters) as AdapterKey[]).find(
    (adapter) => adapter.toLowerCase() === name.toLowerCase(),
  );
  if (foundAdapterName) {
    return adapters[foundAdapterName];
  }
  return undefined;
};
