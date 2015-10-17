//////////////////////////////////////////////////////////////
// COMP-POOL STARTUP SCRIPT
//////////////////////////////////////////////////////////////

var packInf = require('./package.json')
, host = require('os').hostname()
, port = process.env.PORT || 7070 
, env = process.env.NODE_ENV || 'development'
, restify = require('restify')
, logger = require('./logger').getDefaultLogger()
, startup = function () {
  logger.info("STARTING %s:%s app pid=%s", packInf.name, packInf.version, process.pid);

  var server = restify.createServer({
      name       : packInf.name
    , version    : packInf.version
    , log        : logger
  });

  logger.info("Created server");

  // LOAD RESOURCES AND ASSIGN ROUTES AUTOMATICALLY
  server.use(restify.requestLogger());
  server.use(restify.CORS());
  server.use(restify.bodyParser());
  server.on('after', restify.auditLogger({log: logger}));

  logger.info("Started modules");

  server.listen(port, function(){ 
      logger.info('STARTED %s:%s app pid=%s: server %s@%s'
        , packInf.name, packInf.version, process.pid
        , server.name, server.url);
  });
}
, turnoff = function () {
  logger.info("STOPPING %s:%s app pid=%s", packInf.name, packInf.version, process.pid);
  process.exit();
};

process.env.NODE_ENV = env;
process.title = packInf.name;
process.on("SIGTERM", turnoff);
process.on("SIGINT", turnoff);
process.on("SIGHUP", turnoff);

startup();


