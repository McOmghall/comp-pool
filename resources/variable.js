var hal = require('hal')
var url = require('./url-helpers')
var logger = require('../logger').getDefaultLogger()

function Variable (variable, req, restify) {
  logger.info('Creating a variable for %s %s', typeof req.url, req.url)
  hal.Resource.call(this, variable, url.resolvePerRequest(req, req.url))
  this.link('api-root', url.resolvePerRequest(req, restify.router.render('api-root')))
  this.link('jobs-root', url.resolvePerRequest(req, restify.router.render('jobs-root')))
  this.link('get-job', url.resolvePerRequest(req, restify.router.render('get-job', {'id': req.params.job})))
  this.link('variables-root', url.resolvePerRequest(req, restify.router.render('variables-root', {'job': req.params.job})))
  this.link('results-root', url.resolvePerRequest(req, restify.router.render('results-root', {'job': req.params.job, 'id': variable._id})))
}
Variable.prototype = Object.create(hal.Resource.prototype)

module.exports = Variable
