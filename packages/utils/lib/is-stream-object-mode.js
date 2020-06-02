module.exports.isStreamObjectMode = obj => obj.readableObjectMode === true || (obj._readableState && obj._readableState.objectMode === true)
