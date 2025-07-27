/**
 * Remove elements from array by predicate and return the removed elements.
 * This function mutates the original array by removing matching elements.
 * @template T
 * @param {T[]} array - Array to remove elements from (will be mutated)
 * @param {(item: T) => boolean} callback - Predicate function to test each element
 * @returns {T[]} Array of removed elements
 * @example
 * const numbers = [1, 2, 3, 4, 5];
 * const removed = remove(numbers, x => x > 3);
 * // numbers: [1, 2, 3], removed: [4, 5]
 */
exports.remove = function remove (array, callback) {
  const removedItems = [];
  let i = array.length;

  while (i--) {
    if (callback(array[i])) {
      removedItems.push(array[i]);
      array.splice(i, 1);
    }
  }

  return removedItems;
};
