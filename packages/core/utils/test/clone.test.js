const utils = require('../lib');

class TestClass {
  fire () {}
}

describe('Object clone method', () => {
  it('should clone an object', () => {
    const source = {
      name: 'test',
      actions: {
        help () {}
      },
      settings: new TestClass(),
      arrs: [1, 2, 3, 4, 5]
    };

    const newObject = utils.clone(source);
    expect(source).toEqual(newObject);
    expect(typeof source.settings.fire).toBe('function');
  });
});
