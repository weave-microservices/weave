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
        return Number(context.data.a) + Number(context.data.b);
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
        return Math.round(context.data.value);
      }
    }
  }
};
