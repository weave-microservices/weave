/**
 * Deep flattens an array
 * @param {Array<any | any[]>} array array
 * @returns {Array<any>}
 */
exports.flattenDeep = function flattenDeep (array) {
  return array.reduce((acc, e) => {
    if (Array.isArray(e)) {
      return acc.concat(flattenDeep(e));
    } else {
      return acc.concat(e);
    }
  }, []);
};
