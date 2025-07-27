/**
 * Creates a function that tests if an object has a specific internal [[Class]] tag.
 * This is useful for creating type checkers that work reliably across different contexts.
 *
 * @param {string} name - The class name to test for (e.g., 'Array', 'Function', 'Date')
 * @returns {(obj: any) => boolean} A function that tests if an object has the specified tag
 * @example
 * const isArray = tagTester('Array');
 * isArray([1, 2, 3]); // true
 * isArray('hello'); // false
 */
module.exports = name => {
  return (obj) => {
    return Object.prototype.toString.call(obj) === '[object ' + name + ']';
  };
};
