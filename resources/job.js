var hal = require('hal')
var url = require('./url-helpers')
var logger = require('../logger').getDefaultLogger()

function Job (job, req, restify) {
  logger.info('Creating a job for %s %s', typeof req.url, req.url)
  hal.Resource.call(this, job, url.resolvePerRequest(req, req.url))
  this.link('jobs-root', url.resolvePerRequest(req, restify.router.render('jobs-root')))
  this.link('api-root', url.resolvePerRequest(req, restify.router.render('api-root')))
  this.link('variables-root', url.resolvePerRequest(req, restify.router.render('variables-root', {'job': job.name})))
}
Job.prototype = Object.create(hal.Resource.prototype)

module.exports = Job
