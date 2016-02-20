var hal = require('hal')
var url = require('./url-helpers')
var logger = require('../logger').getDefaultLogger()

function VariablesRoot (jobName, relatedVars, req, restify) {
  logger.info('Creating a variable root for %s %s and %s %s', typeof req.url, req.url, typeof relatedVars, JSON.stringify(relatedVars))
  hal.Resource.call(this, {}, url.resolvePerRequest(req, req.url))

  var length = relatedVars.length
  for (var i = 0; i < length; i++) {
    var v = relatedVars[i]
    logger.info('Adding link to %s', v._id)
    this.link(v._id, url.resolvePerRequest(req, restify.router.render('get-variable', {
      'job': jobName,
      'id': v._id
    })))
  }
}
VariablesRoot.prototype = Object.create(hal.Resource.prototype)

module.exports = VariablesRoot
