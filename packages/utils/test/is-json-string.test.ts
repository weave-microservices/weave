import * as utils from '../src';

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
    expect(utils.isJSONString(string)).toBe(true);
  });

  it('should detect malformed JSON object', () => {
    // Malformed JSON
    const string = '{"name":"test","settings":{"a":100,"endpoints" {"http":true,"tcp":false,"ws":[1,2,3]}}}';
    expect(utils.isJSONString(string)).toBe(false);
  });
});
