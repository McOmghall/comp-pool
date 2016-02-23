var hal = require('hal')
var _ = require('underscore')
var url = require('./url-helpers')
var logger = require('../logger').getDefaultLogger()

module.exports.ApiRoot = ApiRoot
module.exports.JobsRoot = JobsRoot
module.exports.Job = Job
module.exports.VariablesRoot = VariablesRoot
module.exports.ResultsRoot = ResultsRoot
module.exports.Variable = Variable

function universalLinks (req, restify) {
  logger.info('Adding universal links for jobId %j, variableId %j, resultId %j', this.jobId, this.variableId, this.resultId)
  this.link('api-root', url.resolvePerRequest(req, restify.router.render('api-root')))
  this.link('jobs-root', url.resolvePerRequest(req, restify.router.render('jobs-root')))
  if (this.jobId) {
    this.link('variables-root', url.resolvePerRequest(req, restify.router.render('variables-root', {'job': this.jobId})))
    this.link('get-job', url.resolvePerRequest(req, restify.router.render('get-job', {'job': this.jobId})))
    if (this.variableId) {
      this.link('results-root', url.resolvePerRequest(req, restify.router.render('results-root', {'job': this.jobId, 'variable': this.variableId})))
    }
  }
}
hal.Resource.prototype.universalLinks = universalLinks

// All [/] routes
function ApiRoot (req, restify) {
  logger.info('Creating an ApiRoot for %s %s', typeof req.url, req.url)
  hal.Resource.call(this, {}, url.resolvePerRequest(req, req.url))
  this.universalLinks(req, restify)
}
ApiRoot.prototype = Object.create(hal.Resource.prototype)

// All [/jobs] routes
function JobsRoot (relatedJobs, req, restify) {
  logger.info('Creating a job root for %s %s and %s %j', typeof req.url, req.url, typeof relatedJobs, relatedJobs)
  hal.Resource.call(this, {}, url.resolvePerRequest(req, req.url))
  _.each(relatedJobs, function (job, index, relatedJobs) {
    logger.info('Adding link to %s', job.name)
    var jobUrl = url.resolvePerRequest(req, restify.router.render('get-job', {'job': job.name}))
    this.link(job.name, jobUrl)
  }, this)
  this.universalLinks(req, restify)
}
JobsRoot.prototype = Object.create(hal.Resource.prototype)

// All [/jobs/:job] routes
function Job (job, req, restify) {
  logger.info('Creating a job for %s %s', typeof req.url, req.url)
  hal.Resource.call(this, job, url.resolvePerRequest(req, req.url))
  this.jobId = req.params.job
  this.universalLinks(req, restify)
}
Job.prototype = Object.create(hal.Resource.prototype)

// All [/jobs/:job/variables] routes
function VariablesRoot (jobName, relatedVars, req, restify) {
  logger.info('Creating a variable root for %s %s and %s %j', typeof req.url, req.url, typeof relatedVars, relatedVars)
  hal.Resource.call(this, {}, url.resolvePerRequest(req, req.url))
  _.each(relatedVars, function (variable, index, relatedVars) {
    logger.info('Adding link to %s', variable._id)
    var variableUrl = url.resolvePerRequest(req, restify.router.render('get-variable', {'job': jobName, 'variable': variable._id}))
    this.link(variable._id, variableUrl)
  }, this)
  this.jobId = jobName
  this.universalLinks(req, restify)
}
VariablesRoot.prototype = Object.create(hal.Resource.prototype)

// All [/jobs/:job/variables/:variable] routes
function Variable (variable, req, restify) {
  logger.info('Creating a variable for %s %s', typeof req.url, req.url)
  hal.Resource.call(this, variable, url.resolvePerRequest(req, req.url))
  this.jobId = req.params.job
  this.variableId = req.params.variable
  this.universalLinks(req, restify)
}
Variable.prototype = Object.create(hal.Resource.prototype)

// All [/jobs/:job/variables/:variable/results] routes
function ResultsRoot (jobName, variableId, relatedResults, req, restify) {
  logger.info('Creating a variable root for %s %s and %s %j', typeof req.url, req.url, typeof relatedResults, relatedResults)
  hal.Resource.call(this, {}, url.resolvePerRequest(req, req.url))
  _.each(relatedResults, function (result, index, relatedVars) {
    logger.info('Adding link to %s', result._id)
    var resultUrl = url.resolvePerRequest(req, restify.router.render('get-result', {'job': jobName, 'variable': variableId, 'result': result._id}))
    this.link(result._id, resultUrl)
  }, this)
  this.jobId = jobName
  this.variableId = req.params.variable
  this.universalLinks(req, restify)
}
ResultsRoot.prototype = Object.create(hal.Resource.prototype)
