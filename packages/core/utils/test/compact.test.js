const utils = require('../lib');

describe('Compact function', () => {
  it('should create an array with all falsey values removed ', () => {
    const array = [1, 2, 3, 4, 5, false, true, undefined, 'Test', { name: 'compact' }];
    const result = utils.compact(array);
    expect(result).toEqual([1, 2, 3, 4, 5, true, 'Test', { 'name': 'compact' }]);
  });
});
