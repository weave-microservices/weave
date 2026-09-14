/**
 * Helper process for the end to end tests of the unhandled error handling.
 *
 * Starts a real broker with the given "unhandledErrorAction" and afterwards
 * produces a real unhandled error. The exit code of this process tells the
 * test whether the node was stopped or kept running.
 *
 * Usage: node unhandled-error-node.js <log|stop|none> <throw|reject>
 */
const { Weave } = require('../../lib/index');

const [, , unhandledErrorAction, mode] = process.argv;

const broker = Weave({
  nodeId: 'unhandled-error-node',
  logger: { enabled: false },
  process: { unhandledErrorAction }
});

broker.start().then(() => {
  if (mode === 'reject') {
    Promise.reject(new Error('Boom (rejection)'));
  } else {
    setTimeout(() => {
      throw new Error('Boom (exception)');
    }, 10);
  }

  // If the node is still alive after the error, report it and exit cleanly.
  setTimeout(() => {
    process.stdout.write('SURVIVED');
    process.exit(0);
  }, 1000);
});
