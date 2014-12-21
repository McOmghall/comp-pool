var _       = require('underscore')
, db        = require('nedb')
, jobs      = new db({filename : './jobs.db'})
, variables = new db({filename : './variables.db'})
, results   = new db({filename : './results.db'});

jobs.ensureIndex({ fieldName: 'name' });
jobs.insert(require('./persisted.json').jobs);

variables.ensureIndex({ fieldName: 'id' });
variables.insert(require('./persisted.json').variables);

results.ensureIndex({ fieldName: 'id' });
results.insert(require('./persisted.json').results);

var jobs_dao = function() {
  this.getById = function (id) {
    return jobs.findOne({name : id});
  };

  this.getAll = function () {
    return jobs.find({});
  };
};

var variables_dao = function() {
  this.getByJobAndId = function (job, id) {
    return variables.find({$and : [{id : id}, {for_job : job}]});
  };
};

var results_dao = function() {
  
};

module.exports.jobs      = new jobs_dao();
module.exports.variables = new variables_dao();
module.exports.results   = new results_dao();
