/**
 * Get Process env var or default value
 * @param key - Environment variable key
 * @param defaultValue - Default value if env var is not set
 * @returns Environment variable value or default value
 */
export function processenv<T = string>(key: string, defaultValue?: T): string | T | undefined {
  return process.env[key] ? process.env[key] : defaultValue;
}
