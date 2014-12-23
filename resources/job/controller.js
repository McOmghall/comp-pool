var persistence = require('./persistence'), _ = require('underscore');

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
                    rep.link(item.name, {href : root + '/' + item.name, name : item.name, title : item.metadata.description.en});
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
                response().code(404);
              }
            });
          },
          "plugins" : {
            "hal" : {
              "prepare" : function(rep, next) {
                console.log("Preparing links");
                rep.link("variables", root + '/' + rep.request.params.job_id + '/variables');
		
		next();
              }
            }
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
                response().code(404);
              }
            });
          }
        }
     },
      {
        "method" : 'GET',
        "path" : root + '/{job_id}/variables',
        "config" : {
          "handler" : function(request, response) {
            response({});
          },
          "plugins" : {
            "hal" : {
              "prepare" : function(rep, next) {
                console.log("Preparing links");
                persistence.variables.getByJob(rep.request.params.job_id, function(result){
                  _.each(result, function(item) {
                    console.log("Working on %s", item._id);
                    rep.link(item._id, root + '/' + rep.request.params.job_id + '/variables/' + item._id);
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
        "method" : 'POST',
        "path" : root + '/{job_id}/variables',
        "config" : {
          "handler" : function(request, response) {
            console.log("Posting variable job %s", request.params.job_id);
            persistence.variables.postNewVariable(request.params.job_id, request.payload, function (variable) {
              if (variable) {
                response().code(201).header('Location', request.path + '/' + variable._id);
              } 
            });
          }
        }
     } ];
};
