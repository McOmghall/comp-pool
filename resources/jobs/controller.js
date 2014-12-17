

module.exports.controller = {
  index : function (request, response) {
    response({message : "you had one job"})
  },
  create : function (request, response) {
	    response({message : "you now have two jobs"})
  }
};

