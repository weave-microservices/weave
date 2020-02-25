module.exports = {
  name: 'math',
  actions: {
    add: {
      cache: {
        keys: ['a', 'b']
      },
      params: {
        a: 'number',
        b: 'number'
      },
      handler (context) {
        return Number(context.params.a) + Number(context.params.b)
      }
    },
    round: {
      cache: {
        keys: ['value']
      },
      params: {
        value: 'number'
      },
      handler (context) {
        return Math.round(context.params.value)
      }
    }
  }
}
