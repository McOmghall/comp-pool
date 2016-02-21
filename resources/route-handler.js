var routeHandlerJobs = require('./route-handler-jobs')
var logger = require('../logger').getDefaultLogger()
var ApiRoot = require('./hal-resources').ApiRoot

function routeHandlerAddRoutes (restify) {
  logger.info('Creating routes for root')

  restify.get({
    name: 'api-root',
    path: '/'
  }, function apiRoot (req, res, next) {
    logger.info('Serving root')
    var response = new ApiRoot(req, restify)
    logger.info('Serving root %s %s', typeof response, JSON.stringify(Object.keys(response)))
    res.send(200, response.toJSON())
    return next()
  })
}

module.exports.addRoutesToServer = function (restify) {
  routeHandlerAddRoutes(restify)
  routeHandlerJobs.addRoutesToServer(restify)
}
