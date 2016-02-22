var dbURI = process.env.DB_URI || process.env.MONGOLAB_URI || 'mongodb://localhost/comp-pool'
var logger = require('../logger').getDefaultLogger().child({
  'widget_type': 'persistence'
})

logger.info('DATABASE SCRIPT STARTED: connect to %s', dbURI)

// We use a real mongodb just in production
var db
var engine
if (process.env.NODE_ENV === 'production') {
  logger.warn('Connecting to database at %s', dbURI)
  engine = require('mongojs')
  db = engine(dbURI)

  db.on('connect', function () {
    logger.info('DATABASE CONNECTED')
  })

  db.on('error', function () {
    logger.error('DATABASE ERRORED')
  })
} else {
  logger.warn('Connecting to in memory database')
  engine = require('tingodb')({
    memStore: true,
    searchInArray: true
  })
  db = new engine.Db(dbURI, {})
}
var jobs = db.collection('jobs')
var variables = db.collection('variables')
var results = db.collection('results')
jobs.name = jobs.name || jobs.collectionName
variables.name = variables.name || variables.collectionName
results.name = results.name || results.collectionName

logger.info('Database gave correct collections')

if (process.env.DB_RELOAD !== 'false') {
  logger.warn('Reloading all DB records')
  reloadDb(require('./persisted.json'), jobs, variables, results)
} else {
  logger.info('Not reloading DB')
}

logger.info('DATABASE EVENTS LOADED')

// All following DAOs only implement non-trivial operations
// Everything else is delegated to the mongodb driver
var JobsDao = function (jobs) {
  this.getAllLinks = function (callback) {
    logger.debug('Getting all jobs links')
    return jobs.find({}, {
      '_id': 0,
      'name': 1
    }).toArray(callback)
  }

  this.findByName = function (name, callback) {
    logger.debug('Finding job by name %s', name)
    return jobs.findOne({
      'name': name
    }, {
      '_id': 0
    }, callback)
  }
}

var VariablesDao = function (variables) {
  this.findByJobName = function (job, callback, forLinks) {
    logger.debug('Finding variables by job name %s (only ids? %s)', job,
      forLinks)
    var projection = (forLinks ? {
      '_id': 1
    } : {
      '_id': 0
    })
    return variables.find({
      'for_jobs': job
    }, projection).toArray(callback)
  }

  this.findByJobForLinks = function (job, callback) {
    return this.findByJobName(job, callback, true)
  }

  this.findByJobAndId = function (job, id, callback) {
    return variables.findOne({
      '_id': id,
      'for_jobs': job
    }, {
      '_id': 0
    }, callback)
  }

  this.findByJobAndVariable = function (jobId, variable, callback) {
    return variables.findOne({
      'for_job': jobId,
      'variable': variable
    }, {
      '_id': 0
    }, callback)
  }
}

/**
 * A DAO FOR RESULTS
 */

var ResultsDao = function (results) {}

module.exports.jobs = Object.assign(jobs, new JobsDao(jobs))
module.exports.variables = Object.assign(variables, new VariablesDao(variables))
module.exports.results = Object.assign(results, new ResultsDao(results))
module.exports.db = db

function bulkRenew (collection, data) {
  logger.info('Loading %j at %s', data, collection)
  collection.remove({}, function (err, res) {
    if (err) {
      logger.error('Something happened while cleaning %s: %j', collection.name, err)
      return err
    }
    collection.insert(data, function (err, newResults) {
      if (err) {
        logger.error('Something happened while loading %s: %j', collection.name, err)
        return err
      }

      logger.info('loaded %j', newResults)
      if (newResults && newResults.length) {
        logger.info('Loaded %s at %s', newResults.length, collection.name)
      } else {
        logger.warn("Didn't load anything")
      }
    })
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
      fieldName: '_id'
    })
    bulkRenew(variables, persisted.variables)
  }

  if (persisted.results.length > 0) {
    results.ensureIndex({
      fieldName: '_id'
    })
    bulkRenew(results, persisted.results)
  }
}
