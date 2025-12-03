import { createNode } from '../helper/index.mts';
import { describe, it } from 'node:test';
import assert from 'node:assert/strict';

describe('Test param validator', () => {
  it('should fail with error and validation data.', (done) => {
    const node1 = createNode({
      nodeId: 'node1',
      logger: {
        enabled: false
      }
    });

    node1.createService({
      name: 'testService',
      actions: {
        sayHello: {
          params: {
            name: { type: 'string', minLength: 10 }
          },
          handler (context) {
            return `Hello ${context.data.name}!`;
          }
        }
      }
    });

    node1.start().then(() => {
      node1.call('testService.sayHello', { name: 'Hans' })
        .catch((error) => {
          assert.strictEqual(error.name, 'WeaveParameterValidationError');
          assert.strictEqual(error.message, 'Request parameter validation error');
          done();
        });
    });
  });

  it('should fail with error and validation data.', (done) => {
    const node1 = createNode({
      nodeId: 'node1',
      logger: {
        enabled: false
      }
    });

    node1.createService({
      name: 'testService',
      actions: {
        sayHello: {
          params: {
            name: 'string'
          },
          handler (context) {
            return `Hello ${context.data.name}!`;
          }
        }
      }
    });

    node1.start().then(() => {
      node1.call('testService.sayHello', { name: 1 })
        .catch(error => {
          assert.strictEqual(error.name, 'WeaveParameterValidationError');
          assert.strictEqual(error.message, 'Request parameter validation error');
          done();
        });
    });
  });
});

describe('Validator strict mode', () => {
  it('should remove invalid params on strict mode "remove" (global)', (done) => {
    const node1 = createNode({
      nodeId: 'node_strict',
      logger: {
        enabled: false
      },
      validatorOptions: {
        strict: true,
        strictMode: 'remove'
      }
    });

    node1.createService({
      name: 'testService',
      actions: {
        sayHello: {
          params: {
            name: { type: 'string' }
          },
          handler (context) {
            assert.strictEqual(context.data.name, 'Hans');
            assert.strictEqual(context.data.lastname, undefined);
            done();
          }
        }
      }
    });

    node1.start().then(() => {
      node1.call('testService.sayHello', { name: 'Hans', lastname: 'hans' });
    });
  });

  it('should throw an error if ther are invalid params on strict mode "error" (global)', (done) => {
    const node1 = createNode({
      nodeId: 'node_strict',
      logger: {
        enabled: false
      },
      validatorOptions: {
        strict: true,
        strictMode: 'error'
      }
    });

    node1.createService({
      name: 'testService',
      actions: {
        sayHello: {
          params: {
            name: { type: 'string' }
          },
          handler () {
            // nothing to do
          }
        }
      }
    });

    node1.start().then(() => {
      node1.call('testService.sayHello', { name: 'Hans', lastname: 'hans' })
        .catch((error) => {
          assert.strictEqual(error.data.length, 1);
          const [validationError] = error.data;

          assert.strictEqual(validationError.action, 'testService.sayHello');
          assert.strictEqual(validationError.expected, 'name');
          assert.strictEqual(validationError.field, '$root');
          assert.strictEqual(validationError.message, 'The object "$root" contains forbidden keys: "lastname".');
          assert.strictEqual(validationError.nodeId, 'node_strict');
          assert.strictEqual(validationError.passed, 'lastname');
          assert.strictEqual(validationError.type, 'objectStrict');
          done();
        });
    });
  });
});

describe('Response validator', () => {
  it('Should validate responses (fails)', (done) => {
    const broker1 = createNode({
      nodeId: 'node_strict',
      logger: {
        enabled: false
      },
      validatorOptions: {
        strict: true,
        strictMode: 'error'
      }
    });

    broker1.createService({
      name: 'testService',
      actions: {
        sayHello: {
          params: {
            name: { type: 'string' }
          },
          responseSchema: {
            firstname: { type: 'string' },
            lastname: { type: 'string' }
          },
          handler (context) {
            if (context.data.name === 'RightName') {
              return { firstname: 'Right', lastname: 'Name' };
            }
            return {
              text: 'Hello User!',
              user: {
                firstname: context.data,
                lastname: 'Wick'
              }
            };
          }
        }
      }
    });

    broker1.start().then(() => {
      broker1.call('testService.sayHello', { name: 'Hans' })
        .catch((error) => {
          assert.strictEqual(error.data.length, 3);
          const [validationError] = error.data;

          assert.strictEqual(validationError.action, 'testService.sayHello');
          assert.strictEqual(validationError.field, 'firstname');

          broker1.call('testService.sayHello', { name: 'RightName' })
            .then((result) => {
              assert.deepStrictEqual(result, { firstname: 'Right', lastname: 'Name' });
              done();
            });
        });
    });
  });
});
