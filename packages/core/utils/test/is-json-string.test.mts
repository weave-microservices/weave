import { describe, it } from 'node:test';
import assert from 'node:assert/strict';
import { isJSONString } from '../lib/is-json-string.mts';

describe('JSON string check', () => {
  it('should detect correct JSON object', () => {
    const source = {
      name: 'test',
      settings: {
        a: 100,
        endpoints: {
          http: true,
          tcp: false,
          ws: [1, 2, 3]
        }
      }
    };
    const string = JSON.stringify(source);
    assert.strictEqual(isJSONString(string), true);
  });

  it('should detect malformed JSON object', () => {
    // Malformed JSON
    const string = '{"name":"test","settings":{"a":100,"endpoints" {"http":true,"tcp":false,"ws":[1,2,3]}}}';
    assert.strictEqual(isJSONString(string), false);
  });
});
