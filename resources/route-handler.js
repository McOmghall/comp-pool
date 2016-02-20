var url = require('./url-helpers')
var hal = require('hal')
var jobs = require('./jobs')
var logger = require('../logger').getDefaultLogger()

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
  jobs.addRoutesToServer(restify)
}

function ApiRoot (req, restify) {
  hal.Resource.call(this, {}, url.resolvePerRequest(req, req.url))
  this.link('jobs-root', url.resolvePerRequest(req, restify.router.render('jobs-root')))
}
ApiRoot.prototype = Object.create(hal.Resource.prototype)
