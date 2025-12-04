/**
 * Checks if an object is a stream object.
 * @param obj - Object to check
 * @returns True if object is a stream
 */
export function isStream(obj: unknown): boolean {
  return !!(
    obj &&
    typeof obj === "object" &&
    "readable" in obj &&
    (obj as Record<string, unknown>).readable === true &&
    typeof (obj as Record<string, unknown>).on === "function" &&
    typeof (obj as Record<string, unknown>).pipe === "function"
  );
}
