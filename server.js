//////////////////////////////////////////////////////////////
// COMP-POOL STARTUP SCRIPT
//////////////////////////////////////////////////////////////

var packInf = require('./package.json'),
  host = require('os').hostname(),
  defaultPort = process.env.PORT || 7070,
  env = process.env.NODE_ENV || 'development',
  restify = require('restify'),
  routeHandler = require('./resources/route-handler'),
  logger = require('./logger').getDefaultLogger(),
  startup = function(port) {
    logger.info("STARTING %s:%s app pid=%s", packInf.name, packInf.version, process.pid);

    var server = restify.createServer({
      name: packInf.name,
      version: packInf.version,
      log: logger,
      formatters: {
        'application/hal+json': function(req, res, body, cb) {
          var rval = JSON.stringify(body);
          logger.debug('Calling hal+json formatter for response %s', rval);
          return cb(null, rval);
        }
      }
    });

    logger.info("Created server");

    // LOAD RESOURCES AND ASSIGN ROUTES AUTOMATICALLY
    server.use(restify.requestLogger());
    server.use(restify.CORS());
    server.use(restify.bodyParser());
    server.on('after', restify.auditLogger({
      log: logger
    }));

    server.on('NotFound', function(req, res, err, cb) {
      res.send('Requested resource ' + req.href());
      return cb();
    });

    server.get("/", function jobRoot(req, res, next) {
      logger.debug("Serving root");
      res.send(200, {
        "_links": {
          "self": {
            "href": 'http://' + req.header('Host') + req.url 
          },
          "hash-of-hashes": {
            "href": "/job/hash-of-hashes"
          }
        }
      });

      next();
    });

    logger.info("Started modules");

    server.listen(port || defaultPort, function() {
      logger.info('STARTED %s:%s app pid=%s: server %s@%s', packInf.name, packInf.version, process.pid, server.name, server.url);
    });
  },
  turnoff = function() {
    logger.info("STOPPING %s:%s app pid=%s", packInf.name, packInf.version, process.pid);
    process.exit();
  };

process.env.NODE_ENV = env;
process.title = packInf.name;
process.on("SIGTERM", turnoff);
process.on("SIGINT", turnoff);
process.on("SIGHUP", turnoff);

module.exports.startup = startup;

if (process.argv[1] == __filename && process.argv[2] == "start") {
  logger.info('STARTING AS PER NPM START %s:%s app pid=%s', packInf.name, packInf.version, process.pid);
  startup();
};
