/**
 * Error Payload factory
 * @param {import("../types").Runtime} runtime Runtime
 * @returns {function(Error)} Generate error payload object
*/
const errorPayloadFactory = (runtime) => (error) => {
  return {
    name: error.name,
    message: error.message,
    nodeId: error.nodeId || runtime.nodeId,
    code: error.code,
    type: error.type,
    stack: error.stack,
    data: error.data
  }
}

module.exports = { errorPayloadFactory }
