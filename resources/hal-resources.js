var hal = require('hal')
var _ = require('underscore')
var url = require('./url-helpers')
var logger = require('../logger').getDefaultLogger()

module.exports.ApiRoot = ApiRoot
module.exports.JobsRoot = JobsRoot
module.exports.Job = Job
module.exports.VariablesRoot = VariablesRoot
module.exports.Variable = Variable

// All [/] routes
function ApiRoot (req, restify) {
  logger.info('Creating an ApiRoot for %s %s', typeof req.url, req.url)
  hal.Resource.call(this, {}, url.resolvePerRequest(req, req.url))
  this.link('jobs-root', url.resolvePerRequest(req, restify.router.render('jobs-root')))
}
ApiRoot.prototype = Object.create(hal.Resource.prototype)

// All [/jobs] routes
function JobsRoot (relatedJobs, req, restify) {
  logger.info('Creating a job root for %s %s and %s %s', typeof req.url, req.url, typeof relatedJobs, JSON.stringify(relatedJobs))
  hal.Resource.call(this, {}, url.resolvePerRequest(req, req.url))
  this.link('api-root', url.resolvePerRequest(req, restify.router.render('api-root')))
  _.each(relatedJobs, function (job, index, relatedJobs) {
    logger.info('Adding link to %s', job.name)
    var jobUrl = url.resolvePerRequest(req, restify.router.render('get-job', {'id': job.name}))
    this.link(job.name, jobUrl)
  })
}
JobsRoot.prototype = Object.create(hal.Resource.prototype)

// All [/jobs/:id] routes
function Job (job, req, restify) {
  logger.info('Creating a job for %s %s', typeof req.url, req.url)
  hal.Resource.call(this, job, url.resolvePerRequest(req, req.url))
  this.link('jobs-root', url.resolvePerRequest(req, restify.router.render('jobs-root')))
  this.link('api-root', url.resolvePerRequest(req, restify.router.render('api-root')))
  this.link('variables-root', url.resolvePerRequest(req, restify.router.render('variables-root', {'job': job.name})))
}
Job.prototype = Object.create(hal.Resource.prototype)

// All [/jobs/:id/variables] routes
function VariablesRoot (jobName, relatedVars, req, restify) {
  logger.info('Creating a variable root for %s %s and %s %s', typeof req.url, req.url, typeof relatedVars, JSON.stringify(relatedVars))
  hal.Resource.call(this, {}, url.resolvePerRequest(req, req.url))
  this.link('api-root', url.resolvePerRequest(req, restify.router.render('api-root')))
  this.link('jobs-root', url.resolvePerRequest(req, restify.router.render('jobs-root')))
  this.link('get-job', url.resolvePerRequest(req, restify.router.render('get-job', {'id': jobName})))
  _.each(relatedVars, function (variable, index, relatedVars) {
    logger.info('Adding link to %s', variable._id)
    var variableUrl = url.resolvePerRequest(req, restify.router.render('get-variable', {'job': jobName, 'id': variable._id}))
    this.link(variable._id, variableUrl)
  })
}
VariablesRoot.prototype = Object.create(hal.Resource.prototype)

// All [/jobs/:id/variables/:variable_id] routes
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

