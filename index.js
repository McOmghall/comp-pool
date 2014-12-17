var packInf = require('./package.json')
  , host    = require('os').hostname()
  , port    = process.env.PORT || 3000
  , env     = process.env.NODE_ENV || 'development'
  , hapi    = require('hapi')
  , resrc   = require('hapi-resourceful-routes')
  , halcs   = require('halacious');
process.env.NODE_ENV = env;


var server = new hapi.Server();
server.connection({ port : port });

server.register(halcs, function(err) {
    if (err) console.error(err);
    console.info("Registered halacious resource manager");
});

server.route(resrc({
  name : 'flow'
, controller : require('./resources/flows.controller.js')
}));

server.route(resrc({
  name : 'job'
, controller : require('./resources/jobs.controller.js').controller
, sub : {
    name : 'variable'
  , controller : require('./resources/variables.controller.js').controller
  , sub : {
      name : 'result'
    , controller : require('./resources/results.controller.js').controller
    }
  }
}));


server.route({
  method: 'GET',
  path: '/',
  config : {cors : true},
  handler: function(req, reply) {
    reply(root_resources);
  }
});

server.start(function(err) {
    if (err) return console.error(err);
    console.info('[SUCCESS] %s:%s running %s %s environment', host, port, server.info.uri, process.env.NODE_ENV);
    console.info('[SUCCESS] registered the following routes: %s', JSON.stringify(server.table(), true));
});



