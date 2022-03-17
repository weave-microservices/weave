module.exports = {
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
    }
  }
};
