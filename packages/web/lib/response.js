const patch = Response => {
    Response.prototype.setContext = function setContext (context) {
        this.$context = context

        // add the request id to the header
        if (context.requestId) {
            this.setHeader('X-Request-Id', context.requestId)
        }
    }

    Response.prototype.setRoute = function setRoute (route) {
        this.$route = route
    }

    Response.prototype.writeHeader = function writeHeader () {
        
    }
}

module.exports = patch
