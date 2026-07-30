/**
 * Checks if a string is a valid JSON string.
 * @param string - String to check
 * @returns True if string is valid JSON
 */
export function isJSONString(string: string): boolean {
  try {
    JSON.parse(string);
  } catch {
    return false;
  }

  return true;
}
