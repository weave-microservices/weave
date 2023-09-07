export function flattenDeep(array: any[]): any[] {
  return array.reduce((acc, e) => {
    if (Array.isArray(e)) {
      return acc.concat(flattenDeep(e));
    } else {
      return acc.concat(e);
    }
  }, []);
};
