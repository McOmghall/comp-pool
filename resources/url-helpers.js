var url = require('url')

url.resolvePerRequest = function (request, href) {
  return this.resolve('http://' + request.header('Host'), href)
}

module.exports = url
