module.exports.controller = {
  index : function(request, response) {},
  show : function(request, response) {
	  response({
		  id : 1
		, for_job_name : "hash-of-hashes"
		, hash : Math.random().toString(36).substr(2)
		});
  }
}
