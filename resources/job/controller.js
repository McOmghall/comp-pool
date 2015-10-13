var persistence = require('./persistence'),
  _ = require('underscore'),
  logger = require('../../logger').getDefaultLogger();

module.exports.controller = function controller(root) {

  return [
      {
        "method" : 'GET',
        "path" : root,
        "config" : {
          "handler" : function(request, response) {
            logger.info("Handling get all jobs");
            response({});
          },
          "plugins" : {
            "hal" : {
              "prepare" : function(rep, next) {
                logger.info("Preparing links");
                persistence.jobs.getAll(function(result){
                  _.each(result, function(item) {
                    rep.link(item.name, {href : root + '/' + item.name, name : item.name, title : item.metadata.description.en});
                  });
                  next();
                });
                
                logger.info("Returning from links");
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
            logger.info("Getting job %s", request.params.job_id);
            persistence.jobs.getById(request.params.job_id, function(job) {
              logger.info("Got job %s", job ? job.name : "NULL");
              if (job) {
                logger.info("Responding job request %s", job);
                response(job);
              } else {
                logger.warn("Job not found %s", job);
                response().code(404);
              }
            });
          },
          "plugins" : {
            "hal" : {
              "prepare" : function(rep, next) {
                logger.info("Preparing links");
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
            logger.info("Getting variable %s for job %s", request.params.variable_id, request.params.job_id);
            persistence.variables.getByJobAndId(request.params.job_id, request.params.variable_id, function (variable) {
              logger.info("Got variable %s", variable ? variable._id.toString() : "NULL");
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
            logger.info("Handling get all variables for %s", request.params.job_id);
            response({});
          },
          "plugins" : {
            "hal" : {
              "prepare" : function(rep, next) {
                logger.info("Preparing links");
                persistence.variables.getByJob(rep.request.params.job_id, function(result){
                  _.each(result, function(item) {
                    rep.link(item._id.toString(), root + '/' + rep.request.params.job_id + '/variables/' + item._id.toString());
                  });
                  next();
                });

                logger.info("Returning from links");
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
            logger.info("Posting variable %s job %s", JSON.stringify(request.payload, null, 2), request.params.job_id);
            persistence.variables.postNewVariable(request.params.job_id, request.payload, function (variable) {
              if (variable) {
                response().code(201).header('Location', request.path + '/' + variable._id.toString());
              } 
            });
          }
        }
     } ];
};
