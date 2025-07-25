/**
 * Delay async execution
 * @param {number} ms Delay in milliseconds
 * @returns {Promise<any>}
*/
exports.delay = (ms) => new Promise(_ => setTimeout(_, ms));
