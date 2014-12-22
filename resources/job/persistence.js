var _       = require('underscore')
, db        = require('nedb')
, jobs      = new db({filename : './jobs.db', autoload: true })
, variables = new db({filename : './variables.db', autoload: true })
, results   = new db({filename : './results.db', autoload: true })
, persisted = require('./persisted.json');

console.log("Loading jobs %s", JSON.stringify(persisted.jobs, null, 2));
jobs.ensureIndex({ fieldName: 'name' });
jobs.remove({});
jobs.insert(persisted.jobs, function(err, newResults) {
  console.log("Loaded %s jobs", newResults.length);
});

console.log("Loading variables %s", JSON.stringify(persisted.variables, null, 2));
variables.ensureIndex({ fieldName: 'id' });
variables.remove({});
variables.insert(persisted.variables, function(err, newResults) {
  console.log("Loaded %s variables", newResults.length);
});

console.log("Loading results %s", JSON.stringify(persisted.results, null, 2));
results.ensureIndex({ fieldName: 'id' });
results.remove({});
results.insert(persisted.results, function(err, newResults) {
  console.log("Loaded %s results", newResults.length);
});

var jobs_dao = function() {
  this.getById = function (id) {
    var result;
    jobs.findOne({name : id}, function (err, res) {
      result = res;
    });
    return result;
  };

  this.getAll = function (callback) {
    jobs.find({}, function (err, res) {
      console.log("Got jobs %s", JSON.stringify(res, null, 2));
      return callback(res);
    });
  };
};

var variables_dao = function() {
  this.getByJobAndId = function (job, id) {
    var result;
    variables.find({$and : [{id : id}, {for_job : job}]}, function (err, res) {
      result = res;
    });
    return result;
  };
};

var results_dao = function() {
  
};

module.exports.jobs      = new jobs_dao();
module.exports.variables = new variables_dao();
module.exports.results   = new results_dao();
