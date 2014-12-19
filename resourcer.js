var fs    = require('fs')
, resrc   = require('hapi-resourceful-routes');

// Logging stopper
var console = {
  info : function () {}
};

// Utility function to add an object to another given it's not null, or empty if specified
var appendSafe = function(object, key, append, empty_objects) {
  if (append) {
    if(!empty_objects && typeof append === 'object' && Object.keys(append).length == 0) {
      return object;
    }
    object[key] = append;
  }

  return object;
};

var resource_list = {};

// Used inside 'getAllControllers' to walk over the tree of resources
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
      var resource_to_append = resource_list[root_name] || {}
      resource_to_append = appendSafe(resource_to_append, 'controller', dir);
      resource_list[root_name] = resource_to_append;
    }
  });

  var rval = {};
  rval = appendSafe(rval, 'name', root_name);
  rval = appendSafe(rval, 'controller', controller, true);
  rval = appendSafe(rval, 'sub', sub);

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

var options_default = {
  resource_root : "./resources"
};

var resourcer = function resourcer() {
  
  this.options = options_default;

  this.start = function () {
    return getAllControllers(this.options.resource_root);
  };

  this.getResourceInfo = function () {
    return resource_list;
  };
};

/**
 * Singleton handler
 */
resourcer.instance = null;

resourcer.getInstance = function () {
  if (this.instance == null) {
    this.instance = new resourcer();
  }
  return this.instance;
};

module.exports = resourcer.getInstance();



