/**
 * Delay async execution
 * @param ms - Delay in milliseconds
 * @returns Promise that resolves after delay
 */
export function delay(ms: number): Promise<void> {
  return new Promise(resolve => setTimeout(resolve, ms));
}
