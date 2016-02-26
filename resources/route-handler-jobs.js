var db = require('./persistence').db
var logger = require('../logger').getDefaultLogger()
var halResources = require('./hal-resources')
var url = require('./url-helpers')
var restify = require('restify')
var VariablesRoot = halResources.VariablesRoot
var JobsRoot = halResources.JobsRoot
var Variable = halResources.Variable
var Job = halResources.Job

function addRoutes (server) {
  server.get({
    name: 'jobs-root',
    path: '/jobs'
  }, function jobsRoot (req, res, next) {
    logger.info('Serving jobs root')

    db.collection('jobs').find({}, {'name': 1}).toArray(function (err, doc) {
      logger.debug('Got err %j doc %j', err, doc)
      next.ifError(err)
      res.send(200, new JobsRoot(doc, req, server).toJSON())
    })
    return next()
  })

  server.get({
    name: 'get-job',
    path: '/jobs/:job'
  }, function getJob (req, res, next) {
    logger.info('Serving a job: %s |%s|', typeof req.params.id, req.params.job)
    db.collection('jobs').findOne({'name': req.params.job}, function (err, doc) {
      logger.debug('Got err %j doc %j', err, doc)
      next.ifError(err)
      if (!doc) {
        logger.debug('Not found that job, sending 404')
        return next(new restify.errors.NotFoundError('Cant find job by id ' + req.params.job))
      } else {
        logger.debug('Sending object')
        res.send(200, new Job(doc, req, server).toJSON())
      }
    })
    return next()
  })

  server.get({
    name: 'variables-root',
    path: '/jobs/:job/variables'
  }, function getVariablesRoot (req, res, next) {
    logger.info('Serving variables root: %s |%s|', typeof req.params.job, req.params.job)
    db.collection('jobs').find({'name': req.params.job}).toArray(function (err, doc) {
      logger.debug('Got err %j doc %j', err, doc)
      next.ifError(err)

      if (!doc) {
        logger.debug('Not found that job, sending 404')
        return next(new restify.errors.NotFoundError('Cant find job by id ' + req.params.job))
      }

      db.collection('variables').find({'for_jobs': req.params.job}, {'_id': 1}).toArray(function (err, doc) {
        logger.debug('Got err %j doc %j', err, doc)
        next.ifError(err)
        var warning = {}
        if (!doc || doc.length === 0) {
          logger.debug('Job has no variables')
          warning = {warningMessage: 'Job has no variables'}
        }

        logger.debug('Sending object')
        res.send(200, Object.assign(new VariablesRoot(req.params.job, doc, req, server).toJSON(), warning))
      })
      return next()
    })
  })

  server.post('/jobs/:job/variables', function saveVariable (req, res, next) {
    logger.info('Posting new variable for: %s |%s|', typeof req.params.job, req.params.job)

    db.collection('variables').save({'for_jobs': req.params.job, 'variable': req.body}, {'w': 1}, function (err, doc) {
      logger.debug('Got err %j doc %j', err, doc)
      next.ifError(err)

      res.header('Location', url.resolvePerRequest(req, server.router.render('get-variable', {'job': req.params.job, 'variable': doc._id})))
      res.send(201, doc)
    })
    return next()
  })

  server.get({
    name: 'get-variable',
    path: '/jobs/:job/variables/:variable'
  }, function getVariable (req, res, next) {
    logger.info('Serving variable: %s |%s| > %s |%s|', typeof req.params.job, req.params.job, typeof req.params.variable, req.params.variable)
    db.collection('variables').findOne({'for_jobs': req.params.job, '_id': req.params.variable}, function (err, doc) {
      logger.debug('Got err %j doc %j', err, doc)
      next.ifError(err)
      if (!doc) {
        logger.debug('Not found that variable, sending 404')
        return next(new restify.errors.NotFoundError('Cant find variables by job id ' + req.params.job + ' and variable id ' + req.params.variable))
      } else {
        logger.debug('Sending object')
        res.send(200, new Variable(doc, req, server).toJSON())
        return next()
      }
    })
  })

  server.get({
    name: 'results-root',
    path: '/jobs/:job/variables/:variable/results'
  }, function getVariable (req, res, next) {
    logger.info('Serving results root for: %s |%s| > %s |%s|', typeof req.params.job, req.params.job, typeof req.params.variable, req.params.variable)
    return next(new restify.errors.BadMethodError('Not implemented yet'))
  })

  server.post('/jobs/:job/variables/:variable/results', function saveResult (req, res, next) {
    logger.info('Posting new result for: %s |%s| > %s |%s|', typeof req.params.job, req.params.job, typeof req.params.variable, req.params.variable)

    db.collection('results').save({'from_job': req.params.job, 'from_variable': req.params.variable, 'result': req.body}, function (err, doc) {
      logger.debug('Got err %j doc %j', err, doc)
      next.ifError(err)

      res.header('Location', url.resolvePerRequest(req, server.router.render('get-result', {'job': req.params.job, 'variable': req.params.variable, 'result': doc._id})))
      res.send(201, doc)
    })
    return next()
  })

  server.get({
    name: 'get-result',
    path: '/jobs/:job/variables/:variable/results/:result'
  }, function getResult (req, res, next) {
    return next(new restify.errors.BadMethodError('Not implemented yet'))
  })
}

module.exports.addRoutesToServer = function (server) {
  addRoutes(server)
}
