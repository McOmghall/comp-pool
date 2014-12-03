var packInf = require('./package.json')
  , restify = require('restify')
  , server  = restify.createServer({
      "name" : "server: " + packInf.name + " v" + packInf.version,
      "formatters" : {
        "application/bs" : function bsfy(request, response, body) {
          response.charSet('utf8');
          response.contentType = "text/plain";
          response.send(417, "bullshit".toString('base64'));
        }
      },
      "version" : packInf.version
    })
  , host    = require('os').hostname()
  , port    = process.env.PORT || 3000
  , env     = process.env.NODE_ENV || 'development';
process.env.NODE_ENV = env;


server.listen(port);

console.log('[SUCCESS] %s:%s running %s %s environment', host, port, server.name, process.env.NODE_ENV);
