module.exports.startOn = function(restify) {
   restify.log.debug("Creating routes for root");

   restify.get("/", function jobRoot(req, res, next) {
    restify.log.debug("Serving root");
    res.send(200, {
      "_links": {
        "hash-of-hashes": {
          "href": "/job/hash-of-hashes"
	}
      }
    });

    return next();
  });
 
};
