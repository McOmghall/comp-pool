var persistence = require('./persistence'), _ = require('underscore'), boom = require('boom');

module.exports.controller = function controller(root) {

  return [
      {
        "method" : 'GET',
        "path" : root,
        "config" : {
          "handler" : function(request, response) {
            response({});
          },
          "plugins" : {
            "hal" : {
              "prepare" : function(rep, next) {
                var objects = persistence.jobs.getAll(function(result){
                  _.each(result, function(item) {
                    console.log("Working on %s", JSON.stringify(item));
                    rep.link(item.name, root + '/' + item.name);
                  });
                });
                
                next();
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
            var job = persistence.jobs.getById(request.params.job_id);
            if (job) {
              response(job);
            } else {
              response(boom.create(404, 'Job not found'));
            }
          }
        }
      },
      {
        "method" : 'GET',
        "path" : root + '/{job_id}/variables/{variable_id}',
        "config" : {
          "handler" : function(request, response) {
            var variable = persistence.variables.getByJobAndId(request.params.job_id);
            if (variable) {
              response(variable);
            } else {
              response(boom.create(404, 'Variable not found'));
            }
          }
        }
      } ];
};
