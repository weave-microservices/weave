/**
 * Capitalize string
 * @param {string} str - String to capitalize
 * @returns {string} Capitalized string
*/
export function capitalize (str: string): string {
  return str.charAt(0).toUpperCase() + str.slice(1);
};
