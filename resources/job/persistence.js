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

/**
 * A DAO FOR JOBS
**/
var jobs_dao = function() {
  this.getById = function (id, callback) {
    jobs.findOne({name : id}, function (err, res) {
      console.log("Got job %s", JSON.stringify(res, null, 2));
      return callback(res);
    });
  };

  this.getAll = function (callback) {
    jobs.find({}, function (err, res) {
      console.log("Got jobs %s", JSON.stringify(res, null, 2));
      return callback(res);
    });
  };
};


/**
 * A DAO FOR VARIABLES
**/
var variables_dao = function() {
  this.getAll = function (callback) {
    variables.find({}, function (err, res) {
      console.log("Got variables %s", JSON.stringify(res, null, 2));
      return callback(res);
    });
  };

  this.getByJob = function (job, callback) {
    variables.find({for_job : job}, function (err, res) {
      console.log("Got variable %s", JSON.stringify(res, null, 2));
      return callback(res);
    });
  };

  this.getByJobAndId = function (job, id, callback) {
    console.log("Queriying for variable id %s and job name %s", id, job);
    variables.findOne({_id : id, "for_job" : job}, function (err, res) {
      console.log("Got variable %s", JSON.stringify(res, null, 2));
      return callback(res);
    });
  };

  this.getByJobAndVariable = function (job, variable, callback) {
    console.log("Queriying for variable type and job name %s", id, job);
    variables.findOne({for_job : job, variable : variable}, function (err, res) {
      return callback(res);
    });
  };

  this.postNewVariable = function (job_id, variable, callback) {
    console.log("Querying for variable as %s and job name %s", JSON.stringify(variable), job_id);
    variables.update({"variable" : variable}, {$addToSet : {for_job : job_id}}, {upsert : true}, function(err, numIfUpdated, res) {
      if (res) {
        return callback(res);
      }
      
      // not new insertion, but update
      variables.findOne({for_job : job_id, variable : variable}, function (err, res) {
        return callback(res);
      });
    });
  };
};


/**
 * A DAO FOR RESULTS
**/

var results_dao = function() {
  
};

module.exports.jobs      = new jobs_dao();
module.exports.variables = new variables_dao();
module.exports.results   = new results_dao();
