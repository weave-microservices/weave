const { dotGet } = require('./dot-get');
const { dotSet } = require('./dot-set');

/**
 * Pick properties of object by array
 * @param {object} object Object
 * @param {Array<string>} props Properties
 * @returns {Object} New result object
*/
exports.pick = (object, props) => {
  const picked = {};

  for (const prop of props) {
    dotSet(picked, prop, dotGet(object, prop));
  }

  return picked;
};
