module.exports.remove = function remove (array, callback) {
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
