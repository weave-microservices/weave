const { createBroker, TransportAdapters } = require('../../../../../packages/core/core/lib');
const repl = require('../../../../../packages/core/repl/lib/index');
const fs = require('fs');

const broker = createBroker({
  nodeId: 'client',
  transport: {
    adapter: TransportAdapters.TCP()
  }
});

broker.createService({
  name: 'client',
  actions: {
    async receive (context) {
      try {
        const stream = await context.call('server.send');
        const file = fs.createWriteStream('target.dmg');
        stream.pipe(file);
        this.log.info('loading file...');
        let size = 0;
        stream.on('data', (chunk) => {
          size += chunk.length;
        });

        stream.on('end', (chunk) => {
          this.log.info(size);
        });

        stream.on('error', (err) => {
          this.log.info(err);
        });
      } catch (error) {
        console.log(error);
      }
    },
    async sendFile (context) {
      const stream = fs.createReadStream(__dirname + '/file.dmg');
      try {
        await context.call('server.receive', { fileName: 'file.dmg' }, { stream });
      } catch (error) {
        console.log(error);
      }
    }
  }
});

broker.start()
  .then(() => repl(broker));

