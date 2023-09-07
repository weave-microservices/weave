import * as utils from '../src';
import os from 'os';

describe('Object clone method', () => {
  it('should clone an object', (done) => {
    const cpus = os.cpus();
    utils.cpuUsage().then(result => {
      expect(result.avg).toBeDefined();
      expect(result.usages.length).toBe(cpus.length);
      done();
    });
  });
});
