import * as utils from '../src';

describe('IP List function', () => {
  it('should return an IP List', () => {
    const regex = /^(([0-9]|[1-9][0-9]|1[0-9]{2}|2[0-4][0-9]|25[0-5])\.){3}([0-9]|[1-9][0-9]|1[0-9]{2}|2[0-4][0-9]|25[0-5])$/;
    const result = utils.getIpList();

    expect(regex.test(result[0])).toBe(true);
  });
});
