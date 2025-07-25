const { dotGet } = require('./dot-get');
const { dotSet } = require('./dot-set');

/**
 * Pick properties of object by keys
 * @template {Object} T
 * @param {T} object Object
 * @param {import('../types').Path<T>[] | string[]} props Properties
 * @returns {Object} New result object
*/
exports.pick = (object, props) => {
  /** @typedef {T} */
  const picked = {};

  for (const prop of props) {
    dotSet(picked, prop, dotGet(object, prop));
  }

  return picked;
};
