// ////////////////////////////////////////////////////////////
// COMP-POOL STARTUP SCRIPT
// ////////////////////////////////////////////////////////////

var packInf = require('./package.json')
var defaultPort = process.env.PORT || 7070
var restify = require('restify')

var routeHandler = require('./resources/route-handler')
var logger = require('./logger').getDefaultLogger()

process.env.NODE_ENV = process.env.NODE_ENV || 'development'
process.title = packInf.name

function startup (port) {
  logger.info('STARTING %s:%s app pid=%s', packInf.name, packInf.version, process.pid)

  JSON.prune = require('json-prune')

  var server = restify.createServer({
    name: packInf.name,
    version: packInf.version,
    log: logger,
    formatters: {
      'application/hal+json': function (req, res, body, cb) {
        logger.info('Calling hal+json formatter for response object (of type %s) with keys %s', typeof body, JSON.stringify(Object.keys(body)))
        return cb(null, JSON.prune(body, {
          replacer: function replacer (value, def, cycle) {
            return (cycle ? '"self-cycle"' : null)
          }
        }))
      }
    }
  })

  logger.info('Created server')

  // LOAD RESOURCES AND ASSIGN ROUTES AUTOMATICALLY
  server.use(restify.requestLogger())
  server.use(restify.CORS())
  server.use(restify.bodyParser({ mapParams: false }))
  server.on('after', restify.auditLogger({
    log: logger
  }))

  routeHandler.addRoutesToServer(server)

  logger.info('Started modules')

  server.listen(port || defaultPort, function () {
    logger.info('STARTED %s %s:%s app pid=%s: server %s@%s', process.env.NODE_ENV, packInf.name, packInf.version, process.pid, server.name, server.url)
  })
}

function turnoff () {
  logger.info('STOPPING %s:%s app pid=%s', packInf.name, packInf.version, process.pid)
  process.exit()
}

process.on('SIGTERM', turnoff)
process.on('SIGINT', turnoff)
process.on('SIGHUP', turnoff)

module.exports.startup = startup

if (process.argv[1] === __filename && process.argv[2] === 'start') {
  logger.info('STARTING AS PER NPM START %s:%s app pid=%s', packInf.name, packInf.version, process.pid)
  startup()
}
