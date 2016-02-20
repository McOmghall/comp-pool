var hal = require('hal')
var url = require('./url-helpers')
var logger = require('../logger').getDefaultLogger()

function JobsRoot (relatedJobs, req, restify) {
  logger.info('Creating a job root for %s %s and %s %s', typeof req.url, req.url, typeof relatedJobs, JSON.stringify(relatedJobs))
  hal.Resource.call(this, {}, url.resolvePerRequest(req, req.url))

  this.link('api-root', url.resolvePerRequest(req, restify.router.render('api-root')))

  var length = relatedJobs.length
  for (var i = 0; i < length; i++) {
    var job = relatedJobs[i]
    logger.info('Adding link to %s', job.name)
    this.link(job.name, url.resolvePerRequest(req, restify.router.render('get-job', {
      'id': job.name
    })))
  }
}
JobsRoot.prototype = Object.create(hal.Resource.prototype)

module.exports = JobsRoot
