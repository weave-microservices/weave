/**
 * Checks if an string is a valid JSON string.
 * @param {string} string String to check
 * @returns {boolean}
 */
exports.isJSONString = function isJSONString (string) {
  try {
    JSON.parse(string);
  } catch (e) {
    return false;
  }

  return true;
};
