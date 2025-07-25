const { Writable } = require('stream');

class MyFancyLogger extends Writable {
  _write (chunk, encoding, callback) {
    const reversedChunk = chunk.toString().split('').reverse().join('');
    process.stdout.write(reversedChunk);
    callback();
  }
}
const loggerStream = new MyFancyLogger();

process.stdin.pipe(loggerStream);

