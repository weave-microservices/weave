module.exports = urlObject => {
    const [_, password] = urlObject.auth ? urlObject.auth.split(':') : []
    return {
        host: urlObject.hostname || defaultOptions.host,
        port: urlObject.port || defaultOptions.port,
        password
    }
}
