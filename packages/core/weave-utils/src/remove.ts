export function remove (array: Array<any>, callback: Function): Array<any> {
  const removedItems = []
  let i = array.length

  while (i--) {
    if (callback(array[i])) {
      removedItems.push(array[i])
      array.splice(i, 1)
    }
  }

  return removedItems
}
