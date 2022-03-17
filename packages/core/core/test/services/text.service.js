module.exports = {
  name: 'text',
  actions: {
    reverse: {
      params: {
        text: 'string'
      },
      handler (context) {
        return context.text.split('').reverse();
      }
    }
  }
};
