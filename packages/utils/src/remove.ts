export type RemoveCallback<T> = (predicate: T) => boolean

export function remove<T>(array: Array<T>, callback: RemoveCallback<T>): Array<T> {
  const removedItems: any[] = [];
  let i = array.length;

  while (i--) {
    if (callback(array[i])) {
      removedItems.push(array[i]);
      array.splice(i, 1);
    }
  }

  return removedItems;
};
