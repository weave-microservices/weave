/**
 * Returns the size of a byte value.
 * @param {number} bytes Bytes as number
 * @returns {string}
 */
exports.bytesToSize = (bytes) => {
  const sizes = ['Bytes', 'KB', 'MB', 'GB', 'TB', 'PB'];

  if (bytes === 0) {
    return '0 Bytes';
  }

  const i = Math.floor(Math.log(bytes) / Math.log(1024));

  return Math.round(bytes / Math.pow(1024, i)) + ' ' + sizes[i];
};
