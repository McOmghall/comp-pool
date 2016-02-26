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
  engine.ObjectID = engine.ObjectId

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
    searchInArray: true,
    nativeObjectID: true
  })
  db = new engine.Db(dbURI, {})
}

logger.info('Database gave correct collections')

if (process.env.DB_RELOAD !== 'false') {
  logger.warn('Reloading all DB records')
  reloadDb(require('./persisted.json'), db.collection('jobs'), db.collection('variables'), db.collection('results'))
} else {
  logger.info('Not reloading DB')
}

logger.info('DATABASE EVENTS LOADED')

module.exports.db = db

function bulkRenew (collection, data) {
  logger.info('Loading %j at %s', data, collection)
  collection.remove({}, function (err, res) {
    if (err) {
      logger.error('Something happened while cleaning %s: %j', collection.collectionName, err)
      return err
    }
    collection.insert(data, function (err, newResults) {
      if (err) {
        logger.error('Something happened while loading %s: %j', collection.collectionName, err)
        return err
      }

      logger.info('loaded %j', newResults)
      if (newResults && newResults.length) {
        logger.info('Loaded %s at %s', newResults.length, collection.collectionName)
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
