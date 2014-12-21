var fs = require('fs')
, resrc = require('hapi-resourceful-routes')
, _ = require('underscore')
, pluralize = require('pluralize');

// Logging stopper
/*
 * var console = { info : function () {} };
 */

// Utility function to add an object to another given it's not null, or empty if
// specified

var rootify = function(string) {
  return '/' + string;
};

var appendSafe = function(object, key, append, empty_objects) {
  if (append) {
    if (!empty_objects && typeof append === 'object'
        && Object.keys(append).length == 0) {
      return object;
    }
    object[key] = append;
  }

  return object;
};

var resource_list = {};

var getAllControllers = function(dir) {
  var controllers = [];

  console.info("Starting resource retrieving on %s", dir);

  fs.readdirSync(dir).forEach(function(file) {
    var pathToRoot = dir + '/' + file;
    var stat = fs.statSync(pathToRoot);

    console.info("File: %s", pathToRoot);

    if (stat && stat.isDirectory()) {
      console.log("Requiring " + pathToRoot + '/controller');
      
      var controller_routes = require(pathToRoot + '/controller').controller(rootify(pluralize(file)));
      if (controller_routes != null) {
        controllers.push(controller_routes);
      }
    }

    console.info("File: %s explored", pathToRoot);
  });

  var merged = [];
  merged = merged.concat.apply(merged, controllers);
  
  console.info("Got controllers %s", JSON.stringify(_.map(merged, function(e){return e.method + ' ' + e.path}), null, 2));
  return merged;
};

var options_default = {
  resource_root : "./resources"
};

var resourcer = function resourcer() {

  this.options = options_default;

  this.start = function() {
    return getAllControllers(this.options.resource_root);
  };

  this.getResourceInfo = function() {
    return resource_list;
  };
};

/**
 * Singleton handler
 */
resourcer.instance = null;

resourcer.getInstance = function() {
  if (this.instance == null) {
    this.instance = new resourcer();
  }
  return this.instance;
};

module.exports = resourcer.getInstance();
