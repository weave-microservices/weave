const patch = Response => {
    Response.prototype.writeHeader = function writeHeader () {
        
    }
}

module.exports = patch
