var packInf = require('./package.json')
  , host    = require('os').hostname()
  , port    = process.env.PORT || 3000
  , env     = process.env.NODE_ENV || 'development'
  , hapi    = require('hapi')
  , halcs   = require('halacious');
process.env.NODE_ENV = env;

// Load resource definition and handlers
var load_resources = function(resource_hash, hapi_instance) {
  var resources = Object.getOwnPropertyNames(resource_hash);
  console.info('Loading resources %s', resources);

  for(resource_index in resources) {
    var resource = resources[resource_index];
    console.info('Loading resource: %s', resource);

    var routes = Object.getOwnPropertyNames(resource_hash[resource].routes)
    for(route_index in routes) {
      var route = routes[route_index];
      hapi_instance.route(route);
    }
  }

  console.info('[SUCCESS] Loaded resources %s', resources);
};

var server = new hapi.Server();
server.connection({ port : port });

server.register(halcs, function(err) {
    if (err) console.error(err);
    console.info("Registered halacious resource manager");
});

load_resources({
  flows :     require('./resources/flow/resource.js')
, jobs :      require('./resources/job/resource.js')
, variables : require('./resources/variable/resource.js')
, results :   require('./resources/result/resource.js')
}, server);

server.route({
    method: 'get',
    path: '/hello/{name}',
    handler: function(req, reply) {
        reply({ message: 'Hello, '+req.params.name });
    }
});

server.start(function(err) {
    if (err) return console.error(err);
    console.info('[SUCCESS] %s:%s running %s %s environment', host, port, server.info.uri, process.env.NODE_ENV);
});



