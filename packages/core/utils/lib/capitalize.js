/**
 * Capitalize string
 * @param {string} str - String to capitalize
 * @returns {string} Capitalized string
*/
exports.capitalize = (str) => {
  return str.charAt(0).toUpperCase() + str.slice(1)
}
