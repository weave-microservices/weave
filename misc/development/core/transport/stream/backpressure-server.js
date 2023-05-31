const crypto = require('crypto');
const { Readable } = require('stream');
const { createBroker, TransportAdapters } = require('../../../../../packages/core/core/lib');
const repl = require('../../../../../packages/core/repl/lib/index');
const fs = require('fs');

process.on('unhandledRejection', (error) => {
  console.error((new Date()).toUTCString() + ' uncaughtException:', error.message);
  console.error(error.stack);
  // process.exit(1)
});

const isPositiveInteger = (object) => {
  return typeof object === 'number' && object > 0 && object === (object | 0);
};

class Producer extends Readable {
  constructor (defaultSize) {
    super();
    this.defaultSize = isPositiveInteger(defaultSize) ? defaultSize : 1024;
    this.produced = 0;
  }

  _read (size) {
    const self = this;
    crypto.randomBytes(size, function (err, data) {
      if (err) {
        return self.emit('error', err);
      }
      self.produced += data.length;
      self.push(data);
    });
  }
}

const broker = createBroker({
  nodeId: 'server',
  transport: {
    adapter: TransportAdapters.TCP()
  }
});

broker.createService({
  name: 'server',
  actions: {
    send (context) {
      return fs.createReadStream(__dirname + '/file.dmg');
    },
    async receive (context) {
      return new Promise(resolve => {
        const stream = fs.createWriteStream(context.data.fileName);
        context.stream.pipe(stream);
        context.stream.on('finish', () => {
          resolve();
        });
      });
    }
  }
});

broker.start()
  .then(() => repl(broker));

