import { WeaveError } from '../../lib/errors.mts';
import { it } from 'node:test';

export default {
  name: 'local',
  actions: {
    hidden: {
      visibility: 'protected',
      params: {
        text: 'string'
      },
      handler (context) {
        return context.data.text.split('').reverse().join('');
      }
    },
    faulty: {
      handler () {
        throw new Error('Missing Data...');
      }
    },
    faultyWeave: {
      handler () {
        throw new WeaveError('Missing Data...', {
          data: {
            name: 'Missing'
          }
        });
      }
    }
  }
};
