const nested2 = require('./nested2.mixin')

module.exports = () => {
  return {
    mixins: [nested2()],
    actions: {
      a () {}
    }
  }
}
