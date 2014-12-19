var packInf = require('./package.json')
  , host    = require('os').hostname()
  , port    = process.env.PORT || 3000
  , env     = process.env.NODE_ENV || 'development'
  , hapi    = require('hapi')
  , halcs   = require('halacious');
process.env.NODE_ENV = env;

var server = new hapi.Server();
server.connection({ port : port });

server.register(halcs, function(err) {
    if (err) console.error(err);
    console.info("Registered halacious resource manager");
});


var resourcer = require('./resourcer');

server.route(resourcer.start());

server.route({
  method: 'GET',
  path: '/',
  config : {cors : true},
  handler: function(req, reply) {
    reply(JSON.stringify(resourcer.getResourceInfo()));
  }
});

console.info('Registered resources %s', JSON.stringify(resourcer.getResourceInfo()));

server.start(function(err) {
    if (err) return console.error(err);
    console.info('[SUCCESS] %s:%s running %s %s environment', host, port, server.info.uri, process.env.NODE_ENV);
});



