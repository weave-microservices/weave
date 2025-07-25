/**
 * Omit fields from object
 * @template {Object} T
 * @template {keyof T} K
 * @param {T} obj
 * @param {K[]} fields
 * @returns {Omit<T, K> | null}
*/
exports.omit = function omit (obj, fields) {
  if (obj === null) {
    return null;
  }

  const shallowCopy = Object.assign({}, obj);

  for (let i = 0; i < fields.length; i++) {
    const key = fields[i];
    delete shallowCopy[key];
  }

  return shallowCopy;
};
