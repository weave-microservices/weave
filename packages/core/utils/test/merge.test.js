const utils = require('../lib');

const flatObject1 = {
  name: 'serv1',
  items: [1, 2, 3],
  actions: {
    a () {},
    b () {},
    c () {}
  }
};

const flatObject2 = {
  name: 'serv2',
  items: [4, 5, 6],
  actions: {
    d () {},
    e () {},
    f () {}
  },
  created () {},
  merged () {}
};

describe('Merge function', () => {
  it('should merge two objects', () => {
    const mergedObject = utils.merge(flatObject1, flatObject2);

    expect(JSON.stringify(mergedObject)).toBe(JSON.stringify({
      name: 'serv2',
      items: [1, 2, 3, 4, 5, 6],
      actions: {
        a () {},
        b () {},
        c () {},
        d () {},
        e () {},
        f () {}
      },
      created () {},
      merged () {}
    }));
  });

  it('should only merge objects. (return null)', () => {
    const target = {};
    const source = 'source';
    const mergedObject = utils.merge(target, source);
    expect(mergedObject).toBe(source);
  });
});

describe('Deep merge function', () => {
  it('should deep merge two objects', () => {
    const mergedObject = utils.deepMerge(flatObject1, flatObject2);
    expect(JSON.stringify(mergedObject)).toBe(JSON.stringify({
      name: 'serv2',
      items: [1, 2, 3, 4, 5, 6],
      actions: {
        a () {},
        b () {},
        c () {},
        d () {},
        e () {},
        f () {}
      },
      created () {},
      merged () {}
    }));
  });
});

