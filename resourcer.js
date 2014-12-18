var fs    = require('fs')
, resrc   = require('hapi-resourceful-routes');

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

var options_default = {
  resource_root : "./resources"
};

module.exports = {
  options : options_default,

  start : function () {
    return getAllControllers(this.options.resource_root);
  }
};