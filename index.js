//////////////////////////////////////////////////////////////
// COMP-POOL STARTUP SCRIPT
//////////////////////////////////////////////////////////////

var packInf = require('./package.json')
, host = require('os').hostname()
, port = process.env.PORT || 7070 
, env = process.env.NODE_ENV || 'development'
, hapi = require('hapi')
, halacious = require('halacious')
, logger = require('./logger').getDefaultLogger();
process.env.NODE_ENV = env;

logger.info("Starting comp-pool app process %s", process.pid);

var server = new hapi.Server();
server.connection({
  port : port
});

// REGISTER HALACIOUS RESTFUL PLUGIN
server.register(halacious, function(err) {
  if (err) return logger.error(err);
  logger.info('Registered halacious resource manager');
});

// LOG EVERY REQUEST AND RESPONSE
server.on('response', function (request) {
  logger.info(request.info.remoteAddress + ': ' + request.method.toUpperCase() + ' ' + request.url.path + ' --> ' + request.response.statusCode);
});

// LOAD RESOURCES AND ASSIGN ROUTES AUTOMATICALLY
var resourcer = require('./resourcer');
server.route(resourcer.start());
server.start(function(err) {
  if (err) return logger.error(err);
  logger.info('[SUCCESS] %s:%s running %s %s environment', host, port, server.info.uri, process.env.NODE_ENV);
});

