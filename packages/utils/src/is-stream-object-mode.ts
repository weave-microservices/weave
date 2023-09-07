export function isStreamObjectMode(obj: any): boolean {
  if (obj.readableObjectMode || obj._readableState) {
    return obj.readableObjectMode === true || (obj._readableState && obj._readableState.objectMode === true);
  } else if (obj.writableObjectMode || obj._writableState) {
    return obj.writableObjectMode === true || (obj._writableState && obj._writableState.objectMode === true);
  } else {
    return false;
  }
};
