var bunyan = require('bunyan')
var _ = require('underscore')
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

function createLogger (options) {
  options = options || {}

  if (!logger) {
    try {
      require('fs').mkdirSync('./logs')
    } catch (e) {
      if (String(e.code) !== 'EEXIST') {
        throw e
      }
    }
    logger = bunyan.createLogger(_.extendOwn(option_defaults, options))
  }

  return logger
}
