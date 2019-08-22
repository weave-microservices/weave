const patch = Request => {
    Request.prototype.isKeepAlive = function isKeepAlive () {
        if (this.$keepAlive !== undefined) {
            return this.$keepAlive
        }

        if (this.headers.connection) {
            this.$keepAlive = /keep-alive/i.test(this.headers.connection)
        } else {
            this.$keepAlive = this.httpVersion !== '1.0'
        }

        return this.$keepAlive
    }
}

module.exports = patch
