var persistence = require('./persistence')
var logger = require('../logger').getDefaultLogger()
var halResources = require('./hal-resources')
var VariablesRoot = halResources.VariablesRoot
var JobsRoot = halResources.JobsRoot
var Variable = halResources.Variable
var Job = halResources.Job

function addRoutes (restify) {
  restify.get({
    name: 'jobs-root',
    path: '/jobs'
  }, function jobsRoot (req, res, next) {
    logger.info('Serving jobs root')

    persistence.jobs.getAllLinks(function (err, doc) {
      logger.info('Got err %j doc %j', err, doc)
      if (err) {
        return next(err)
      }
      res.send(200, new JobsRoot(doc, req, restify).toJSON())
      return next()
    })
  })

  restify.get({
    name: 'get-job',
    path: '/jobs/:id'
  }, function getJob (req, res, next) {
    logger.info('Serving a job: %s |%s|', typeof req.params.id, req.params.id)
    persistence.jobs.findByName(req.params.id, function (err, doc) {
      logger.info('Got err %j doc %j', err, doc)
      if (!doc) {
        logger.debug('Not found that job, sending 404')
        res.send(404)
      } else {
        logger.debug('Sending object')
        res.send(200, new Job(doc, req, restify).toJSON())
      }
      return next()
    })
  })

  restify.get({
    name: 'variables-root',
    path: '/jobs/:job/variables'
  }, function getVariablesRoot (req, res, next) {
    logger.info('Serving variables root: %s |%s|', typeof req.params.job, req.params.job)
    persistence.variables.findByJobForLinks(req.params.job, function (err, doc) {
      logger.info('Got err %j doc %j', err, doc)
      if (err) {
        return next(err)
      }
      logger.debug('Sending object')
      res.send(200, new VariablesRoot(req.params.job, doc, req, restify).toJSON())

      return next()
    })
  })

  restify.get({
    name: 'get-variable',
    path: '/jobs/:job/variables/:id'
  }, function getVariable (req, res, next) {
    logger.info('Serving variable: %s |%s| > %s |%s|', typeof req.params.job, req.params.job, typeof req.params.id, req.params.id)
    persistence.variables.findByJobAndId(req.params.job, req.params.id, function (err, doc) {
      logger.info('Got err %j doc %j', err, doc)
      if (err) {
        return next(err)
      }
      logger.debug('Sending object')
      res.send(200, new Variable(doc, req, restify).toJSON())

      return next()
    })

    return next()
  })

  restify.get({
    name: 'results-root',
    path: '/jobs/:job/variables/:id/results'
  }, function getVariable (req, res, next) {
    logger.info('Serving results root for: %s |%s| > %s |%s|', typeof req.params.job, req.params.job, typeof req.params.id, req.params.id)
    res.send(200)
    return next()
  })
}

module.exports.addRoutesToServer = function (restify) {
  addRoutes(restify)
}
