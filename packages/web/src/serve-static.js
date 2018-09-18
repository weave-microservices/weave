/**
 * Created by kevinries on 18.03.17.
 */
const url = require('url')
const path = require('path')
const fs = require('fs')

function ServeStatic (folder, options) {
    options.indexFile = options.indexFile || 'index.html'
    options.showIndexFile = options.showIndexFile || true
    options.cache = options.cache || true
    const fallThrough = options.fallThrough !== false

    const mimeTypes = {
        'html': 'text/html',
        'jpeg': 'image/jpeg',
        'jpg': 'image/jpeg',
        'png': 'image/png',
        'js': 'text/javascript',
        'css': 'text/css',
        'text': 'text/plain'
    }

    return function (request, response, next) {
        var req = request
        if (request.method !== 'GET' && request.method !== 'HEAD') {
            if (fallThrough) {
                return next()
            }
            res.statusCode = 405
            res.setHeader('Allow', 'GET, HEAD')
            res.setHeader('Content-Length', '0')
            res.end()
            return
        }
            var uri = url.parse(req.url).pathname
            var stats
            returnFile(path.join(folder, decodeURI(uri)))
            function returnFile (filePath) {
                // var filePath = path.join(folder, _fileName)
                try {
                    stats = fs.lstatSync(filePath) // throws if path doesn't exist
                    if (stats.isFile()) {
                        const file = fs.createReadStream(filePath)
                        const filetype = path.extname(filePath).split('.').reverse()[0]
                        const mimeType = mimeTypes[filetype] || 'text'

                        file.on('finish', () => {
                            file.close()
                        })

                        if (options.cache) {
                            response.setHeader('Cache-Control', 'public, max-age=31536000')
                        }

                        response.setHeader('Content-Type', mimeType)
                        response.setHeader('Content-Length', stats.size)
                        response.setHeader('Access-Control-Allow-Origin', '*');

                        // Request methods you wish to allow
                        response.setHeader('Access-Control-Allow-Methods', 'GET, POST, OPTIONS, PUT, PATCH, DELETE');
                    
                        // Request headers you wish to allow
                        response.setHeader('Access-Control-Allow-Headers', 'X-Requested-With,content-type');
                    
                        file.pipe(response)
                    } else if (stats.isDirectory()) {
                        if (options.showIndexFile) {
                            returnFile(path.join(filePath, options.indexFile))
                        } else {
                            next()
                        }
                    } else {
                        this.error = 500
                    }
                } catch (e) {
                    next(e)
                }
            }
        
    }
}
module.exports = ServeStatic
