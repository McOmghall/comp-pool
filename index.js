var express = require('express')
  , app     = express()
  , packInf = require('./package.json')
  , host    = require('os').hostname()
  , port    = process.env.PORT || 3000;

app.set('host', host);
app.set('port', port);
app.listen(3000);

console.log('%s %s environment', packInf.name, app.get('env'));
