const patch = Response => {
    Response.prototype.setContext = function setContext (context) {
        this.$context = context
    }

    Response.prototype.setRoute = function setRoute (route) {
        this.$route = route
    }

    Response.prototype.writeHeader = function writeHeader () {
        
    }
}

module.exports = patch
