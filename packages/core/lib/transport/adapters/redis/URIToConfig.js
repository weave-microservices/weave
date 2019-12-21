module.exports = urlObject => {
    // const [_, password] = urlObject.auth ? urlObject.auth.split(':') : []
    return {
        url: urlObject.href
    }
}
