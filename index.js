//////////////////////////////////////////////////////////////
// COMP-POOL STARTUP SCRIPT
//////////////////////////////////////////////////////////////

var packInf = require('./package.json')
, host = require('os').hostname()
, port = process.env.PORT || 7070 
, env = process.env.NODE_ENV || 'development'
, restify = require('restify')
, logger = require('./logger').getDefaultLogger();
process.env.NODE_ENV = env;

logger.info("STARTING %s:%s app pid=%s", packInf.name, packInf.version, process.pid);

// LOAD RESOURCES AND ASSIGN ROUTES AUTOMATICALLY

server = restify.createServer({
    name       : packInf.name
  , version    : packInf.version
  , log        : logger
});


server.use(restify.requestLogger());
server.use(restify.CORS());
server.use(restify.bodyParser());

server.on('after', restify.auditLogger({log: logger}));

server.listen(port, function(){ 
    logger.info('STARTED %s:%s app pid=%s: server %s@%s'
      , packInf.name, packInf.version, process.pid
      , server.name, server.url);
});
