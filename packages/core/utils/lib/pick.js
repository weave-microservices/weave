const { dotGet } = require('./dot-get');
const { dotSet } = require('./dot-set');

/**
 * Pick properties from an object by their keys.
 * Supports dot notation for nested properties.
 * @template {Object} T
 * @param {T} object - Source object to pick properties from
 * @param {string[]} props - Array of property paths to pick (supports dot notation)
 * @returns {Object} New object containing only the picked properties
 * @example
 * pick({a: 1, b: 2, c: 3}, ['a', 'c']); // {a: 1, c: 3}
 * pick({user: {name: 'John', age: 30}}, ['user.name']); // {user: {name: 'John'}}
 */
exports.pick = (object, props) => {
  /** @typedef {T} */
  const picked = {};

  for (const prop of props) {
    dotSet(picked, prop, dotGet(object, prop));
  }

  return picked;
};
