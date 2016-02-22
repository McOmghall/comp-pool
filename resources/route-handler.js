var routeHandlerJobs = require('./route-handler-jobs')
var logger = require('../logger').getDefaultLogger()
var ApiRoot = require('./hal-resources').ApiRoot

function routeHandlerAddRoutes (server) {
  logger.info('Creating routes for root')

  server.on('NotFound', function (req, res, err, cb) {
    logger.error('Not found %s', req.url)
    err = Object.assign(err || {}, new ApiRoot(req, server).toJSON())
    return cb()
  })

  server.get({
    name: 'api-root',
    path: '/'
  }, function apiRoot (req, res, next) {
    logger.info('Serving root %s %s', typeof res, JSON.stringify(Object.keys(res)))
    res.send(200, new ApiRoot(req, server).toJSON())
    return next()
  })
}

module.exports.addRoutesToServer = function (server) {
  routeHandlerAddRoutes(server)
  routeHandlerJobs.addRoutesToServer(server)
}
