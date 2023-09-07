const { isStream } = require('@weave-js/utils');
const { Readable, Writable } = require('stream');
const { createNode } = require('../../helper');

describe('Streaming', () => {
  it('should return a requested stream', done => {
    const broker1 = createNode({
      nodeId: 'node1',
      logger: {
        enabled: false,
        level: 'fatal'
      },
      transport: {
        adapter: 'dummy'
      }
    });

    const broker2 = createNode({
      nodeId: 'node2',
      logger: {
        enabled: false,
        level: 'fatal'
      },
      transport: {
        adapter: 'dummy'
      }
    });

    const testService = {
      name: 'test',
      actions: {
        getStream () {
          const stream = new Readable({
            read () {}
          });

          return stream;
        }
      }
    };

    broker1.createService(testService);

    Promise.all([
      broker1.start(),
      broker2.start()
    ])
      .then(() => broker2.call('test.getStream'))
      .then(res => {
        expect(isStream(res)).toBe(true);
        return Promise.all([
          broker1.stop(),
          broker2.stop()
        ]);
      }).then(() => {
        done();
      });
  });

  it('should return a requested stream', done => {
    const broker1 = createNode({
      nodeId: 'node4',
      logger: {
        enabled: false,
        level: 'fatal'
      },
      transport: {
        adapter: 'dummy'
      }
    });

    const broker2 = createNode({
      nodeId: 'node5',
      logger: {
        enabled: false,
        level: 'fatal'
      },
      transport: {
        adapter: 'dummy'
      }
    });

    const testService = {
      name: 'test',
      actions: {
        saveStream (context) {
          const stream = context.stream;
          return new Promise((resolve) => {
            const chunks = [];
            const ws = new Writable({
              objectMode: true,
              write (chunk, _, done) {
                chunks.push(chunk);
                done();
              }
            });

            ws.on('finish', () => {
              resolve(chunks.map(c => c.counter).sort().join(','));
            });

            stream.pipe(ws);
          });
        }
      }
    };

    broker1.createService(testService);

    Promise.all([
      broker1.start(),
      broker2.start()
    ])
      .then(() => {
        let counter = 6;

        const stream = new Readable({
          objectMode: true,
          read () {
            if (counter < 10) {
              this.push({ counter });
            } else {
              this.push(null);
            }
            counter++;
          }
        });

        return broker2.call('test.saveStream', { fileName: 'dog.jpeg' }, { stream })
          .then(chunks => {
            expect(chunks).toBe('6,7,8,9');
            done();
          });
      });
  });
});
