/**
 * Checks if a Node.js stream is in object mode.
 * Object mode allows streams to work with objects instead of just strings and buffers.
 * @param {NodeJS.ReadStream | NodeJS.WriteStream} obj - The stream to check
 * @returns {boolean} True if the stream is in object mode, false otherwise
 */
exports.isStreamObjectMode = (obj) => {
  if (obj.readableObjectMode || obj._readableState) {
    return obj.readableObjectMode === true || (obj._readableState && obj._readableState.objectMode === true);
  } else if (obj.writableObjectMode || obj._writableState) {
    return obj.writableObjectMode === true || (obj._writableState && obj._writableState.objectMode === true);
  } else {
    return false;
  }
};
