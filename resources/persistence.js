var mongojs = require('mongojs')
var dbURI = process.env.MONGOLAB_URI || 'mongodb://localhost/comp-pool'
var db = mongojs(dbURI)
var jobs = db.collection('jobs')
var variables = db.collection('variables')
var results = db.collection('results')
var logger = require('../logger').getDefaultLogger().child({
  'widget_type': 'persistence'
})

db.reload = reloadDb

logger.info('DATABASE SCRIPT STARTED: connect to %s', dbURI)

db.on('connect', function () {
  logger.info('DATABASE CONNECTED')
})

db.on('error', function () {
  logger.error('DATABASE ERRORED')
})

if (process.env.RELOAD_DATABASE !== 'false') {
  db.reload(require('./persisted.json'), jobs, variables, results)
}

logger.info('DATABASE EVENTS LOADED')

// All following DAOs only implement non-trivial operations
// Everything else is delegated to the mongodb driver
var JobsDao = function (jobs) {
  this.db = jobs

  this.getAllLinks = function (callback) {
    logger.debug('Getting all links')
    return this.db.find({}, {
      '_id': 0,
      'name': 1
    }, callback)
  }

  this.findByName = function (name, callback) {
    logger.debug('Finding by name %s', name)
    return this.db.findOne({
      'name': name
    }, {
      '_id': 0
    }, callback)
  }
}

var VariablesDao = function (variables) {
  this.db = variables

  this.findByJobName = function (job, callback, forLinks) {
    var projection = (forLinks ? {'_id': 1} : {})
    return this.db.find({
      'for_job': job
    }, projection, callback)
  }

  this.findByJobForLinks = function (job, callback) {
    return this.findByJobName(job, callback, true)
  }

  this.findByJobAndId = function (job, id, callback) {
    return this.db.findOne({
      '_id': mongojs.ObjectId(id),
      'for_job': job
    }, callback)
  }

  this.findByJobAndVariable = function (jobId, variable, callback) {
    return this.db.findOne({
      'for_job': jobId,
      'variable': variable
    }, callback)
  }
}

/**
 * A DAO FOR RESULTS
 **/

var ResultsDao = function (results) {
  this.db = results
}

module.exports.jobs = new JobsDao(jobs)
module.exports.variables = new VariablesDao(variables)
module.exports.results = new ResultsDao(results)

function bulkRenew (collection, data) {
  logger.info('Loading %s %s', collection, JSON.stringify(data, null, 2))
  collection.remove({})
  collection.insert(data, function (err, newResults) {
    if (err) {
      logger.error('Something happened while loading %s: %s', collection, JSON.stringify(err))
      return err
    }
    var count = 0
    if (newResults && newResults.length) {
      count = newResults.length
    }

    logger.info('Loaded %s at %s', count, collection)
  })
}

function reloadDb (persisted, jobs, variables, results) {
  if (persisted.jobs.length > 0) {
    jobs.ensureIndex({
      fieldName: 'name'
    })
    bulkRenew(jobs, persisted.jobs)
  }

  if (persisted.variables.length > 0) {
    variables.ensureIndex({
      fieldName: 'id'
    })
    bulkRenew(variables, persisted.variables)
  }

  if (persisted.results.length > 0) {
    results.ensureIndex({
      fieldName: 'id'
    })
    bulkRenew(results, persisted.results)
  }
}
