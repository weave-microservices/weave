/* eslint-disable no-unused-vars */
/* eslint-disable no-undef */
module.exports = urlObject => {
  const [_, password] = urlObject.auth ? urlObject.auth.split(':') : []
  return {
    host: urlObject.hostname || defaultOptions.host,
    port: urlObject.port || defaultOptions.port,
    password
  }
}
