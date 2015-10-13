var bunyan = require('bunyan')
, option_defaults = {
    name    : 'comp-pool'
  , streams : [{
      type: 'rotating-file'
    , path: './logs/foo.log'
    , period: '1d'
    , count: 3
  },
  {
      stream: process.stdout 
  }]
}
, logger = null
, extend = function extend(destination, source) {
  for (var k in source) {
    if (source.hasOwnProperty(k)) {
      destination[k] = source[k];
    }
  }
  return destination; 
}
, createLogger = function createLogger(options) {
    options = options || {};

    if (!logger) {
      mkdirSync('./logs');
      logger = bunyan.createLogger(extend(option_defaults, options));
    }

    return logger;
};

var mkdirSync = function (path) {
  try {
    require('fs').mkdirSync(path);
  } catch(e) {
    if ( e.code != 'EEXIST' ) throw e;
  }
}

module.exports.getDefaultLogger = createLogger;
