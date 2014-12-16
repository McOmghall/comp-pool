module.exports.routes = [
  {
    path : '/'
  , method : 'GET'
  , config : {
      cors : true
    , plugins : {
        hal : {
          links : {
            'scheduler' : './scheduled/'
          , 'jobs' : {
              href : './:job_id/'
            , templated : true
            }
          }
        }
      }
    }
  , handler : function (request, reply) {
      reply({message : "Welcome"});
    }
  }



];

