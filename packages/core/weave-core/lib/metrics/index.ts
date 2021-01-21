// @ts-expect-error ts-migrate(2451) FIXME: Cannot redeclare block-scoped variable 'Constants'... Remove this comment to see the full error message
const Constants = require('./constants')

module.exports = {
  MetricsStorage: require('./registry'),
  Constants
}
