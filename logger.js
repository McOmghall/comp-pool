var bunyan = require('bunyan')
var option_defaults = {
  name: 'comp-pool',
  streams: [{
    type: 'rotating-file',
    path: './logs/comp-pool.log',
    period: '1d',
    count: 3
  },
    {
      stream: process.stdout,
      level: bunyan.DEBUG
    }]
}

module.exports.getDefaultLogger = createLogger

var logger = null

function extend (destination, source) {
  for (var k in source) {
    if (source.hasOwnProperty(k)) {
      destination[k] = source[k]
    }
  }
  return destination
}

function createLogger (options) {
  options = options || {}

  if (!logger) {
    mkdirSync('./logs')
    logger = bunyan.createLogger(extend(option_defaults, options))
  }

  return logger
}

function mkdirSync (path) {
  try {
    require('fs').mkdirSync(path)
  } catch (e) {
    if (String(e.code) !== 'EEXIST') {
      throw e
    }
  }
}
