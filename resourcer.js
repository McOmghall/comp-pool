var fs = require('fs')
, resrc = require('hapi-resourceful-routes')
, _ = require('underscore')
, pluralize = require('pluralize')
, logger = require('./logger').getDefaultLogger(); 


var rootify = function(string) {
  return '/' + string;
};

// Utility function to add an object to another given it's not null, or empty if specified
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

  logger.info("Starting resource retrieving on %s", dir);

  fs.readdirSync(dir).forEach(function(file) {
    var pathToRoot = dir + '/' + file;
    var stat = fs.statSync(pathToRoot);

    logger.debug("File: %s", pathToRoot);

    if (stat && stat.isDirectory()) {
      logger.debug("Requiring " + pathToRoot + '/controller');
      
      var controller_routes = require(pathToRoot + '/controller').controller(rootify(pluralize(file)));
      if (controller_routes != null) {
        controllers.push(controller_routes);
      }
    }

    logger.info("File: %s explored", pathToRoot);
  });

  var merged = [];
  merged = merged.concat.apply(merged, controllers);
  
  logger.info("Got controllers %s", _.map(merged, function(e) {return e.method + ' ' + e.path}));
  return merged;
};

var options_default = {
  resource_root : "./resources"
};

var resourcer = function resourcer() {

  this.options = options_default;
  this.resource_list = [];

  this.start = function(route_function) {
    this.resource_list = getAllControllers(this.options.resource_root);

    logger.info("Got routes %s", this.resource_list);

    return this.resource_list;
  };

  this.getResourceInfo = function() {
    return this.resource_list;
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
