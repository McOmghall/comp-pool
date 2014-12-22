var persistence = require('./persistence'), _ = require('underscore'), boom = require('boom');

module.exports.controller = function controller(root) {

  return [
      {
        "method" : 'GET',
        "path" : root,
        "config" : {
          "handler" : function(request, response) {
            console.log("Handling get all jobs");
            response({});
          },
          "plugins" : {
            "hal" : {
              "prepare" : function(rep, next) {
                console.log("Preparing links");
                persistence.jobs.getAll(function(result){
                  _.each(result, function(item) {
                    console.log("Working on %s", item.name);
                    rep.link(item.name, root + '/' + item.name);
                  });
                  
                  console.log("Handling async stuff correctly");
                  next();
                });
                
                console.log("Returning from links");
              }
            }
          }
        }
      },
      {
        "method" : 'GET',
        "path" : root + '/{job_id}',
        "config" : {
          "handler" : function(request, response) {
            console.log("Getting job %s", request.params.job_id);
            persistence.jobs.getById(request.params.job_id, function(job) {
              console.log("Got job %s", JSON.stringify(job));
              if (job) {
                response(job);
              } else {
                response(boom.create(404, 'Job not found'));
              }
            });
          }
        }
      },
      {
        "method" : 'GET',
        "path" : root + '/{job_id}/variables/{variable_id}',
        "config" : {
          "handler" : function(request, response) {
            console.log("Getting variable %s for job %s", request.params.variable_id, request.params.job_id);
            persistence.variables.getByJobAndId(request.params.job_id, request.params.variable_id, function (variable) {
              if (variable) {
                response(variable);
              } else {
                response(boom.create(404, 'Variable not found'));
              }
            });
          }
        }
     } ];
};
