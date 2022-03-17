const { match } = require('../lib');

describe('pattern match function', () => {
  it('should match patterns', () => {
    expect(match('1.2.3', '1.2.3')).toBe(true);
    expect(match('1.2.3.4', '1.2.3.4')).toBe(true);

    expect(match('1.2.3', '1.2.*')).toBe(true);
    expect(match('1.3.3', '1.2.*')).toBe(false);

    expect(match('1.2.3', '1.?.3')).toBe(true);
    expect(match('1.2.3', '$1.?.3')).toBe(false);

    expect(match('1', '*')).toBe(true);
    expect(match('11', '**')).toBe(true);

    expect(match('12.45.67', '12.45.**')).toBe(true);
  });
});
