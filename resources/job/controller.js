var persistence = require('./persistence');

module.exports.controller = {
  index : function (request, response) {
    response(JSON.stringify(persistence.getAll()));
  },
  create : function (request, response) {
    response({message : "you now have two jobs"})
  },
  show : function (request, response) {
    console.log("Show %s", JSON.stringify(request.params));
    var rval = persistence.getById(request.params.job_id);
    response(JSON.stringify(rval));
  }
};

