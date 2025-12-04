/**
 * Checks if a Node.js stream is in object mode.
 * Object mode allows streams to work with objects instead of just strings and buffers.
 * @param obj - The stream to check
 * @returns True if the stream is in object mode, false otherwise
 */
export function isStreamObjectMode(obj: unknown): boolean {
  if (!obj || typeof obj !== "object") {
    return false;
  }

  const stream = obj as Record<string, unknown>;

  if (stream.readableObjectMode || stream._readableState) {
    const readableState = stream._readableState as Record<string, unknown> | undefined;
    return !!(
      stream.readableObjectMode === true ||
      (readableState && readableState.objectMode === true)
    );
  } else if (stream.writableObjectMode || stream._writableState) {
    const writableState = stream._writableState as Record<string, unknown> | undefined;
    return !!(
      stream.writableObjectMode === true ||
      (writableState && writableState.objectMode === true)
    );
  } else {
    return false;
  }
}
