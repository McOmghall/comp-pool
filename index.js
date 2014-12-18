var packInf = require('./package.json')
  , host    = require('os').hostname()
  , port    = process.env.PORT || 3000
  , env     = process.env.NODE_ENV || 'development'
  , hapi    = require('hapi')
  , resrc   = require('hapi-resourceful-routes')
  , halcs   = require('halacious')
  , fs      = require("fs");
process.env.NODE_ENV = env;

var appendSafe = function(object, key, append, empty_objects) {
  if (append) {
    if(!empty_objects && typeof append === 'object' && Object.keys(append).length == 0) {
      return object;
    }
    object[key] = append;
  }

  return object;
};

var getAllControllersInner = function(root_name, dir) {
  var controller = {};
  var sub        = {};

  console.info("Exploring subdir: %s with name %s", dir, root_name);

  fs.readdirSync(dir).forEach(function(file) {
    var pathToRoot = dir + '/' + file;
    var stat = fs.statSync(pathToRoot);

    if (stat && stat.isDirectory()) {
      sub        = getAllControllersInner(file, pathToRoot);
    } else if (file == 'controller.js') {
      controller = require(pathToRoot).controller;
    }
  });

  var rval = {};
  rval = appendSafe(rval, 'name', root_name, false);
  rval = appendSafe(rval, 'controller', controller, true);
  rval = appendSafe(rval, 'sub', sub, false);

  console.info("Adding new route with %s", JSON.stringify(rval));
 
  return rval;
};

var getAllControllers = function(dir) {
  var controllers = [];
 
  console.info("Starting resource retrieving on %s", dir);

  fs.readdirSync(dir).forEach(function(file) {
    var pathToRoot = dir + '/' + file;
    var stat = fs.statSync(pathToRoot);
    
    console.info("File: %s", pathToRoot);

    if (stat && stat.isDirectory()) {
      controllers.push(resrc(getAllControllersInner(file, pathToRoot)));
    }

    console.info("File: %s explored", pathToRoot);
  });

  console.info("Got controllers %s", JSON.stringify(controllers));

  var merged = [];
  merged = merged.concat.apply(merged, controllers);
  return merged;
};


var server = new hapi.Server();
server.connection({ port : port });

server.register(halcs, function(err) {
    if (err) console.error(err);
    console.info("Registered halacious resource manager");
});


server.route(getAllControllers('./resources')); 

server.route({
  method: 'GET',
  path: '/',
  config : {cors : true},
  handler: function(req, reply) {
    reply(server.table());
  }
});

server.start(function(err) {
    if (err) return console.error(err);
    console.info('[SUCCESS] %s:%s running %s %s environment', host, port, server.info.uri, process.env.NODE_ENV);
});



