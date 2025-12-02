import { describe, it } from 'node:test';
import assert from 'node:assert/strict';
import { merge, deepMerge } from '../lib/merge.mts';

const flatObject1 = {
  name: 'serv1',
  items: [1, 2, 3],
  actions: {
    a() {},
    b() {},
    c() {}
  }
};

const flatObject2 = {
  name: 'serv2',
  items: [4, 5, 6],
  actions: {
    d() {},
    e() {},
    f() {}
  },
  created() {},
  merged() {}
};

describe('Merge function', () => {
  it('should merge two objects', () => {
    const mergedObject = merge(flatObject1, flatObject2);

    assert.strictEqual(JSON.stringify(mergedObject), JSON.stringify({
      name: 'serv2',
      items: [1, 2, 3, 4, 5, 6],
      actions: {
        a() {},
        b() {},
        c() {},
        d() {},
        e() {},
        f() {}
      },
      created() {},
      merged() {}
    }));
  });

  it('should only merge objects. (return source)', () => {
    const target = {};
    const source = 'source';
    const mergedObject = merge(target as any, source as any);
    assert.strictEqual(mergedObject, source);
  });
});

describe('Deep merge function', () => {
  it('should deep merge two objects', () => {
    const mergedObject = deepMerge(flatObject1, flatObject2);
    assert.strictEqual(JSON.stringify(mergedObject), JSON.stringify({
      name: 'serv2',
      items: [1, 2, 3, 4, 5, 6],
      actions: {
        a() {},
        b() {},
        c() {},
        d() {},
        e() {},
        f() {}
      },
      created() {},
      merged() {}
    }));
  });
});
