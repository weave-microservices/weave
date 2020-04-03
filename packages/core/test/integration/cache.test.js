const { Weave } = require('../../lib/index')

describe('Cache system', () => {
  it('should call lifecycle hook "created" with correct scope if there are nested hooks from a mixin.', (done) => {
    const node1 = Weave({
      nodeId: 'node1',
      logger: {
        enabled: false
      },
      cache: {
        enabled: true
      }
    })

    node1.createService({
      name: 'testService',
      actions: {
        cachedAction: {
          cache: {
            keys: ['text']
          },
          handler (context) {
            return context.params.text.split('').reverse().join('')
          }
        }
      }
    })
    node1.start().then(() => {
      node1.call('testService.cachedAction', { text: 'hello user' })
        .then(result => {
          expect(result).toBe('resu olleh')
          node1.stop()
          done()
        })
    })
  })
})
