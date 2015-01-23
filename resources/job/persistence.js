var _       = require('underscore')
, mongojs   = require('mongojs')
, db        = mongojs(process.env.MONGOLAB_URI || "mongodb://localhost/comp-pool")
, jobs      = db.collection("jobs")
, variables = db.collection("variables")
, results   = db.collection("results")
, persisted = require('./persisted.json');

console.log("Loading jobs %s", JSON.stringify(persisted.jobs, null, 2));
jobs.ensureIndex({ fieldName: 'name' });
jobs.remove({});
jobs.insert(persisted.jobs, function(err, newResults) {
  var count = 0;
  if (newResults && newResults.length) {
    count = newResults.length;
  }

  console.log("Loaded %s jobs", count);
});

console.log("Loading variables %s", JSON.stringify(persisted.variables, null, 2));
variables.ensureIndex({ fieldName: 'id' });
variables.remove({});
variables.insert(persisted.variables, function(err, newResults) {
  var count = 0;
  if (newResults && newResults.length) {
    count = newResults.length;
  }

  console.log("Loaded %s variables", count);
});

console.log("Loading results %s", JSON.stringify(persisted.results, null, 2));
results.ensureIndex({ fieldName: 'id' });
results.remove({});
results.insert(persisted.results, function(err, newResults) {
  var count = 0;
  if (newResults && newResults.length) {
    count = newResults.length;
  }

  console.log("Loaded %s results", count);
});

/**
 * A DAO FOR JOBS
**/
var jobs_dao = function() {
  this.getById = function (id, callback) {
    jobs.findOne({name : id}, function (err, res) {
      return callback(res);
    });
  };

  this.getAll = function (callback) {
    jobs.find({}, function (err, res) {
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
      return callback(res);
    });
  };

  this.getByJob = function (job, callback) {
    variables.find({for_job : job}, function (err, res) {
      return callback(res);
    });
  };

  this.getByJobAndId = function (job, id, callback) {
    variables.findOne({_id : mongojs.ObjectId(id), "for_job" : job}, function (err, res) {
      return callback(res);
    });
  };

  this.getByJobAndVariable = function (job, variable, callback) {
    variables.findOne({for_job : job, variable : variable}, function (err, res) {
      return callback(res);
    });
  };

  this.postNewVariable = function (job_id, variable, callback) {
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
