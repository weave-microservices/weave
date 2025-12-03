import { createBaseTracingCollector } from '../../../lib/tracing/collectors/base.mts';
import { createFakeRuntime } from '../../helper/runtime.mts';
// import { createEndpoint } from '../../lib/registry/endpoint.mts';
import { describe, it } from 'node:test';
import assert from 'node:assert/strict';

// const fakeAction = {
//   name: 'testaction',
//   handler: () => {}
// }

const runtime = createFakeRuntime();

describe('Test base tracing colletor factory.', () => {
  it('should define default .', () => {
    const baseCollector = createBaseTracingCollector(runtime);

    const flattened = baseCollector.flattenTags(null);

    assert.strictEqual(flattened, null);
  });

  it('should define default .', () => {
    const baseCollector = createBaseTracingCollector(runtime);

    const flattened = baseCollector.flattenTags({
      nodeId: '123',
      options: {
        transport: {
          adapter: 'tcp',
          port: 4000
        }
      }
    });

    assert.strictEqual(flattened.nodeId, '123');
    assert.strictEqual(flattened['options.transport.adapter'], 'tcp');
    assert.strictEqual(flattened['options.transport.port'], 4000);
  });

  it('should flatten tags and convert to string .', () => {
    const baseCollector = createBaseTracingCollector(runtime);

    const flattened = baseCollector.flattenTags({
      nodeId: '123',
      options: {
        transport: {
          adapter: 'tcp',
          port: 4000
        }
      }
    }, true);

    assert.strictEqual(flattened.nodeId, '123');
    assert.strictEqual(flattened['options.transport.adapter'], 'tcp');
    assert.strictEqual(flattened['options.transport.port'], '4000');
  });

  it('should flatten tags and convert to string .', () => {
    const baseCollector = createBaseTracingCollector(runtime);

    const fields = baseCollector.getErrorFields(new Error('Something went wrong!'), ['message']);

    assert.strictEqual(fields.message, 'Something went wrong!');
  });
});
