const nested3 = require('./nested3.mixin')

module.exports = () => {
  return {
    mixins: [nested3()],
    actions: {
      b () {}
    }
  }
}
