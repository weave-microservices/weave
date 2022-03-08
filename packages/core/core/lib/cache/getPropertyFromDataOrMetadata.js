const { dotGet } = require('@weave-js/utils')

/**
 * Get property from data or metadata object.
 * @param {any} data data object
 * @param {object} metadata metadata object
 * @param {string} key key
 * @returns {any} Result
 */
const getPropertyFromDataOrMetadata = (data, metadata, key) => {
  // if a key starts with ":", the property is picked from metadata
  if (key.startsWith(':')) {
    // remove ':' from key.
    key = key.replace(':', '')
    return dotGet(metadata, key)
  }
  return dotGet(data, key)
}

module.exports = { getPropertyFromDataOrMetadata }
