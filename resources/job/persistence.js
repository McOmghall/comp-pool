var _ = require('underscore')
  , fs = require('fs');

var resource = function() {
  this.getById = function (id) {
    console.log("Get by %s", id);
    var obj = JSON.parse(fs.readFileSync('./resources/job/persisted.json', 'utf8'));
    return _.find(obj, function (array_obj) {return array_obj.name == id;});
  };

  this.getAll = function () {
    return JSON.parse(fs.readFileSync('./resources/job/persisted.json', 'utf8'));
  };
}


module.exports = new resource();
