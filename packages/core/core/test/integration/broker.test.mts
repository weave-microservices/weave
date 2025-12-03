import { Readable } from 'stream';
import { createNode } from '../helper/index.mts';
import { describe, it, beforeEach, afterEach, before, after } from 'node:test';
import assert from 'node:assert/strict';

describe('Test broker lifecycle', () => {
  it('should create a broker and call the started/stopped hook.', async () => {
    let startedCalled = false;
    let stoppedCalled = false;

    const node1 = createNode({
      nodeId: 'node-lifecycle1',
      // logger: {
      //   enabled: false,
      //   level: 'fatal'
      // },
      started: () => { startedCalled = true; },
      stopped: () => { stoppedCalled = true; }
    });

    await node1.start();
    assert.strictEqual(startedCalled, true);

    await node1.stop();
    assert.strictEqual(stoppedCalled, true);
  });
});

describe('Test broker call service', () => {
  it('should call a service.', async () => {
    const node1 = createNode({
      nodeId: 'node-call1',
      logger: {
        enabled: false,
        level: 'fatal'
      }
    });

    let testCalled = false;

    const service = node1.createService({
      name: 'testService',
      actions: {
        test: () => { testCalled = true; },
        test2: () => {}
      }
    });

    await node1.start();
    await node1.call('testService.test');
    assert.strictEqual(testCalled, true);
  });

  it('should call a service action and return a value.', async () => {
    const node1 = createNode({
      nodeId: 'node-call21',
      logger: {
        enabled: false
      }
    });

    node1.createService({
      name: 'testService',
      actions: {
        sayHello (context) {
          return `Hello ${context.data.name}!`;
        }
      }
    });

    await node1.start();
    const result = await node1.call('testService.sayHello', { name: 'Hans' });
    assert.strictEqual(result, 'Hello Hans!');
  });
});

describe('Test broker call error handling', () => {
  it('should call a service action and be rejected with an error.', async () => {
    const node1 = createNode({
      nodeId: 'node1-call',
      logger: {
        enabled: false
      }
    });

    node1.createService({
      name: 'testService',
      actions: {
        sayHello (context) {
          return Promise.reject(new Error('Error from action'));
        }
      }
    });

    await node1.start();
    await assert.rejects(
      node1.call('testService.sayHello', { name: 'Hans' }),
      { message: 'Error from action' }
    );
  });

  it('should call a service action and be rejected with an error from a sub action.', async () => {
    const node1 = createNode({
      nodeId: 'node-call3',
      logger: {
        enabled: false
      }
    });

    node1.createService({
      name: 'testService',
      actions: {
        sayHello (context) {
          return context.call('testService.greetings', context.data);
        },
        greetings (context) {
          return Promise.reject(new Error('Error from action level ' + context.level));
        }
      }
    });

    await node1.start();
    await assert.rejects(
      node1.call('testService.sayHello', { name: 'Hans' }),
      { message: 'Error from action level 2' }
    );
    await node1.stop();
  });
});

// describe('Test broker trasnport resolver', () => {
//   it('should resolve the transport adapter by name (string).', () => {
//     const broker = Weave({
//       nodeId: 'node1',
//       logger: {
//         enabled: false
//       },
//       transport: 'dummy'
//     })

//     assert.strictEqual(broker.runtime.transport.adapterName, 'Dummy')
//     broker.stop()
//   })
// })

describe('Ping', () => {
  it('should result an empty array if the transporter is not connected.', async () => {
    const broker = createNode({
      nodeId: 'node-ping1',
      logger: {
        enabled: false
      }
    });
    await broker.start();
    const res = await broker.ping();
    assert.deepStrictEqual(res, {});
    await broker.stop();
  });
  it('should return an empty object if no nodes are connected.', async () => {
    const broker = createNode({
      nodeId: 'node-ping2',
      logger: {
        enabled: false
      },
      transport: {
        adapter: 'dummy'
      }
    });

    await broker.start();
    const res = await broker.ping();
    assert.deepStrictEqual(res, {});
    await broker.stop();
  });

  it('should return results of all connected nodes.', async () => {
    const broker1 = createNode({
      nodeId: 'node-ping3',
      logger: {
        enabled: false
      },
      transport: {
        adapter: 'dummy'
      }
    });

    const broker2 = createNode({
      nodeId: 'node-ping4',
      logger: {
        enabled: false
      },
      transport: {
        adapter: 'dummy'
      }
    });

    await Promise.all([
      broker1.start(),
      broker2.start()
    ]);
    const res = await broker1.ping();
    assert.notStrictEqual(res['node-ping4'], undefined);
    assert.notStrictEqual(res['node-ping4'].timeDiff, undefined);
    assert.ok(res['node-ping4'].elapsedTime < 5);
    assert.strictEqual(res['node-ping4'].nodeId, 'node-ping4');
    await Promise.all([
      broker1.stop(),
      broker2.stop()
    ]);
  });

  it('should throw a timeout error if a node not responding.', async () => {
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

    await Promise.all([
      broker1.start(),
      broker2.start()
    ]);
    const res = await broker1.ping('node3'); // node with this name is not existing
    assert.strictEqual(res, null);
    await Promise.all([
      broker1.stop(),
      broker2.stop()
    ]);
  });

  it('should return result of a given nodeId.', async () => {
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

    await Promise.all([
      broker1.start(),
      broker2.start()
    ]);
    const res = await broker1.ping('node5');
    assert.ok(res.elapsedTime < 5);
    assert.notStrictEqual(res.timeDiff, undefined);
    assert.strictEqual(res.nodeId, 'node5');
    await Promise.all([
      broker1.stop(),
      broker2.stop()
    ]);
  });
  it('should return results of all connected nodes.', async () => {
    const broker1 = createNode({
      nodeId: 'node-ping41',
      logger: {
        enabled: false,
        level: 'fatal'
      },
      transport: {
        adapter: 'dummy'
      }
    });

    const broker2 = createNode({
      nodeId: 'node-ping42',
      logger: {
        enabled: false,
        level: 'fatal'
      },
      transport: {
        adapter: 'dummy'
      }
    });

    await Promise.all([
      broker1.start(),
      broker2.start()
    ]);
    const res = await broker1.ping('node-ping42');
    assert.ok(res.elapsedTime < 5);
    assert.notStrictEqual(res.timeDiff, undefined);
    assert.strictEqual(res.nodeId, 'node-ping42');
    await Promise.all([
      broker1.stop(),
      broker2.stop()
    ]);
  });
});

describe('Test broker error handling', () => {
  const ERROR_CODE = 1;
  let broker;

  beforeEach(async () => {
    broker = createNode({
      nodeId: 'node1_' + Date.now(),
      logger: {
        enabled: true,
        level: 'fatal'
      }
    });

    await broker.start();
  });

  afterEach(() => {
    broker.stop()
      .catch(_ => {});
  });

  it('"fatalError" should kill the node process', async () => {
    let exitCalled = false;
    let exitCode: number | null = null;
    const originalExit = process.exit;
    
    // Create a promise that resolves when process.exit is called
    const exitPromise = new Promise<void>((resolve, reject) => {
      process.exit = ((code?: number) => {
        exitCalled = true;
        exitCode = code ?? 0;
        // Don't throw, just resolve to avoid unhandled rejection
        resolve();
      }) as any;
    });

    // Trigger fatal error
    broker.fatalError('Throw some fatal error', new Error('Absolutly fatal'));
    
    // Wait for the graceful shutdown to call process.exit
    await exitPromise;

    assert.strictEqual(exitCalled, true);
    assert.strictEqual(exitCode, ERROR_CODE);
    process.exit = originalExit;
  });
});

describe('Test broker context chaining', () => {
  const broker = createNode({
    nodeId: 'node1',
    logger: {
      enabled: false,
      level: 'fatal'
    }
  });

  broker.createService({
    name: 'post',
    actions: {
      before (context) {
        const flow = [{ requestId: context.requestId, contextId: context.id, parentId: context.parentId }];
        return context.call('post.before2', { flow });
      },
      before2 (context) {
        context.data.flow.push({ requestId: context.requestId, contextId: context.id, parentId: context.parentId });
        return context.call('post.find');
      },
      find: (context) => context
    }
  });

  before(async () => broker.start());
  after(async () => broker.stop());

  it('level should be = 1', async () => {
    const context = await broker.call('post.find');
    assert.notStrictEqual(context.id, undefined);
    assert.strictEqual(context.level, 1);
    assert.deepStrictEqual(context.id, context.requestId);
  });

  it('should increment level on chained calls', async () => {
    const context = await broker.call('post.before');
    assert.notStrictEqual(context.id, undefined);
    assert.strictEqual(context.level, 3);
    assert.notStrictEqual(context.id, context.requestId);
    assert.deepStrictEqual(context.options.parentContext.parentId, context.requestId);
  });
});

describe('Test maxCallLevel', () => {
  const broker = createNode({
    nodeId: 'node2',
    logger: {
      enabled: false,
      level: 'fatal'
    },
    registry: {
      maxCallLevel: 1
    }
  });

  broker.createService({
    name: 'post',
    actions: {
      before (context) {
        const flow = [{ requestId: context.requestId, contextId: context.id, parentId: context.parentId }];
        return context.call('post.before2', { flow });
      },
      before2 (context) {
        context.data.flow.push({ requestId: context.requestId, contextId: context.id, parentId: context.parentId });
        return context.call('post.find');
      },
      find: (context) => context
    }
  });

  before(async () => broker.start());
  after(async () => broker.stop());

  it('level should be = 1', async () => {
    const context = await broker.call('post.find');
    assert.notStrictEqual(context.id, undefined);
    assert.strictEqual(context.level, 1);
    assert.deepStrictEqual(context.id, context.requestId);
  });

  it('should increment level on chained calls', async () => {
    await assert.rejects(
      broker.call('post.before'),
      { message: 'Request level has reached the limit 1 on node "node2".' }
    );
  });
});

describe('Error handler', () => {
  let errorHandlerCalled = false;
  const errorHandler = () => { errorHandlerCalled = true; };

  const broker = createNode({
    nodeId: 'node3',
    errorHandler: errorHandler
  });

  broker.createService({
    name: 'test',
    actions: {
      callAndThrowError (context) {
        throw new Error('Something went wrong');
      }
    }
  });
  it('should call the global error handler', async () => {
    await broker.start();
    try {
      await broker.call('test.callAndThrowError');
      assert.strictEqual(errorHandlerCalled, true);
    } catch (error) {
      // Expected to throw
    }
  });
});

describe('Error handler', () => {
  const broker = createNode({
    nodeId: 'node4',
    logger: {
      enabled: false
    }
  });

  broker.createService({
    name: 'test',
    actions: {
      callAndThrowError (context) {
        throw new Error('Something went wrong');
      }
    }
  });
  it('should call the global error handler', async () => {
    await broker.start();
    await assert.rejects(
      broker.call('test.callAndThrowError'),
      { message: 'Something went wrong' }
    );
  });
});

describe('Streaming (lokal)', () => {
  const broker = createNode({
    nodeId: 'node-local-streaming',
    logger: {
      enabled: false
    }
  });

  it('should handle local streaming', async () => {
    broker.createService({
      name: 'file',
      actions: {
        write (context) {
          assert.notStrictEqual(context.stream, undefined);
        }
      }
    });

    await broker.start();

    broker.call('file.write', {}, { stream: new Readable() });
  });

  it('should handle local streaming', async () => {
    broker.createService({
      name: 'file',
      actions: {
        write (context) {
          assert.notStrictEqual(context.stream, undefined);
        }
      }
    });

    await broker.start();

    try {
      broker.call('file.write', {}, { stream: 'wrong type' });
    } catch (error) {
      assert.strictEqual(error.message, 'No valid stream.');
    }
  });
});

// describe('Streaming (lokal)', () => {
//   it('should handle local streaming', async (done) => {
//     const broker = Weave({
//       nodeId: 'node1',
//       logger: {
//         enabled: false
//       }
//     })

//     broker.createService({
//       name: 'file',
//       actions: {
//         write (context) {
//           assert.notStrictEqual(context.stream, undefined)
//           done()
//         }
//       }
//     })

//     await broker.start()

//     broker.call('file.write', {}, { stream: new Readable() })

//     await broker.stop()
//   })

//   it('should handle local streaming', async (done) => {
//     const broker = Weave({
//       nodeId: 'node1',
//       logger: {
//         enabled: false
//       }
//     })

//     broker.createService({
//       name: 'file',
//       actions: {
//         write (context) {
//           // assert.notStrictEqual(context.stream, undefined)
//         }
//       }
//     })

//     await broker.start()

//     try {
//       broker.call('file.write', {}, { stream: 'wrong type' })
//     } catch (error) {
//       assert.strictEqual(error.message, 'No valid stream.')
//       await broker.stop()
//       done()
//     }
//   })
// })

describe('Streaming (remote)', () => {
  const broker1 = createNode({
    nodeId: 'node1-remote-streaming',
    transport: {
      adapter: 'dummy'
    },
    logger: {
      enabled: false
    }
  });

  const broker2 = createNode({
    nodeId: 'node2-remote-streaming',
    transport: {
      adapter: 'dummy'
    },
    logger: {
      enabled: false
    }
  });

  it('should handle local streaming', async () => {
    broker1.createService({
      name: 'file',
      actions: {
        write (context) {
          assert.notStrictEqual(context.stream, undefined);
        }
      }
    });

    await Promise.all([broker1.start(), broker2.start()]);

    await broker2.call('file.write', {}, { stream: new Readable({ read () {} }) });

    await Promise.all([broker1.start(), broker2.start()]);
  });
});

describe('Wait for Services', () => {
  it('should fail if the service not appears', async () => {
    const broker1 = createNode({
      nodeId: 'node1-wait-for-service',
      transport: {
        adapter: 'dummy'
      },
      logger: {
        enabled: false
      }
    });

    await broker1.start();
    await assert.rejects(
      broker1.waitForServices(['unknown'], 2000),
      { message: 'The waiting of the services is interrupted due to a timeout.' }
    );
  });
});
