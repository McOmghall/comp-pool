/* global angular*/
require('angular')
var _ = require('underscore')

angular
  .module('CompPoolClient', [])
  .factory('compPoolClient', ['compPoolRoot', '$http', '$log', '$q', compPoolClient])

function compPoolClient (compPoolRoot, $http, $log, $q) {
  $log.debug('Creating compPoolClient for comp-pool at %s', compPoolRoot)
  var apiRootManager = new ApiRoot($http, $log)
  var apiRootPromise = $http.get(compPoolRoot).then(function (apiRoot) {
    $log.debug('Got api root %j', apiRoot)
    return apiRootManager.actual(apiRoot.data)
  })
  return Object.assign(apiRootPromise, apiRootManager)
}

function Actualizable () {}
Actualizable.prototype.actual = function (value) {
  this.realizedValue = value
  return this
}

ApiRoot.prototype = Object.create(Actualizable.prototype)
function ApiRoot ($http, $log) {
  Actualizable.call(this)
  var jobsRootManager = new JobsRoot($http, $log)

  this.getJobsRoot = function () {
    $log.debug('Getting jobs root with %j > %j', this, this.realizedValue)
    if (this.realizedValue == null) {
      return this.then(function (apiRoot) {
        return apiRoot.getJobsRoot()
      })
    }
    var jobsRoot = this.realizedValue._links['jobs-root'].href

    var jobsRootPromise = $http.get(jobsRoot).then(function (jobsRoot) {
      $log.debug('Got jobs root %j', jobsRoot)
      return jobsRootManager.actual(jobsRoot.data)
    })
    return Object.assign(jobsRootPromise, jobsRootManager)
  }
}

JobsRoot.prototype = Object.create(Actualizable.prototype)
function JobsRoot ($http, $log) {
  Actualizable.call(this)
  var jobManager = new Job($http, $log)

  this.getJob = function (jobId) {
    $log.debug('Getting a job by id %s', jobId)
    if (this.realizedValue == null) {
      return this.then(function (jobRoot) {
        return jobRoot.getJob(jobId)
      })
    }

    var job = this.realizedValue._links[jobId].href

    var jobPromise = $http.get(job).then(function (job) {
      $log.debug('Got job %j', job)
      return jobManager.actual(realizeJobAsFunction(job.data))
    })
    return Object.assign(jobPromise, jobManager)
  }

  this.getRandomJob = function () {
    $log.debug('Getting a random job with %j > %j', this, this.realizedValue)
    if (this.realizedValue == null) {
      return this.then(function (jobRoot) {
        return jobRoot.getRandomJob()
      })
    }

    var relsArray = _.reject(Object.keys(this.realizedValue._links), rejectAdministrativeLinks)
    $log.debug('Getting a random job from links %j', relsArray)
    var randomLink = relsArray[Math.floor(Math.random() * relsArray.length)]
    $log.debug('Getting a random job: resolved id %s', randomLink)
    return this.getJob(randomLink)
  }
}

Job.prototype = Object.create(Actualizable.prototype)
function Job ($http, $log) {
  Actualizable.call(this)
  var variablesRootManager = new VariablesRoot($http, $log)

  this.getVariablesRoot = function () {
    $log.debug('Getting a variables root with %j > %j', this, this.realizedValue)
    if (this.realizedValue == null) {
      return this.then(function (job) {
        return job.getVariablesRoot()
      })
    }

    var variablesRoot = this.realizedValue._links['variables-root'].href

    variablesRootManager.setJob(this.realizedValue)
    var variablesRootPromise = $http.get(variablesRoot).then(function (variablesRoot) {
      $log.debug('Got variables root %j for job %j', variablesRoot, variablesRootManager.job)
      return variablesRootManager.actual(variablesRoot.data)
    })
    return Object.assign(variablesRootPromise, variablesRootManager)
  }
}

VariablesRoot.prototype = Object.create(Actualizable.prototype)
function VariablesRoot ($http, $log) {
  Actualizable.call(this)
  var variableManager = new Variable($http, $log)
  this.job = null

  this.getVariable = function (variableId) {
    $log.debug('Getting a variable by id %s', variableId)
    if (this.realizedValue == null) {
      return this.then(function (variable) {
        return variable.getVariable(variableId)
      })
    }

    var variable = this.realizedValue._links[variableId].href
    variableManager.setJob(this.job)
    var variablePromise = $http.get(variable).then(function (variable) {
      $log.debug('Got variable %j for job %j', variable, variableManager.job)
      return variableManager.actual(variable.data)
    })
    return Object.assign(variablePromise, variableManager)
  }

  this.getRandomVariable = function () {
    $log.debug('Getting a random variable with %j > %j', this, this.realizedValue)
    if (this.realizedValue == null) {
      return this.then(function (variableRoot) {
        return variableRoot.getRandomVariable()
      })
    }

    var relsArray = _.reject(_.reject(Object.keys(this.realizedValue._links), rejectAdministrativeLinks), function (link) {
      return link === 'get-job'
    })
    $log.debug('Getting a random variable from links %j', relsArray)
    var randomLink = relsArray[Math.floor(Math.random() * relsArray.length)]
    $log.debug('Getting a random variable: resolved id %s', randomLink)
    return this.getVariable(randomLink)
  }

  this.setJob = function (job) {
    this.job = job
    return this
  }
}

Variable.prototype = Object.create(Actualizable.prototype)
function Variable ($http, $log) {
  Actualizable.call(this)
  this.job = null
  this.result = null

  this.compute = function () {
    $log.debug('Triying to compute %j > %j > %j', this, this.realizedValue, this.job)
    if (this.realizedValue == null) {
      return this.then(function (variable) {
        return variable.compute()
      })
    }

    this.result = this.job['function'](this.realizedValue.variable, {})
    $log.debug('Computed %j', this.result)
    return this
  }

  this.saveResult = function (options) {
    options = (typeof options === 'object' ? options : null) || {}
    if (this.realizedValue == null) {
      return this.then(function (variable) {
        return variable.saveResult(options)
      })
    }
    if (this.result == null) {
      return this.compute().then(function (variable) {
        return variable.saveResult(options)
      })
    }

    var resultsRootURI = this.realizedValue._links['results-root'].href
    $http.post(resultsRootURI, this.result)
    if (options.asVariableToo) {
      var variablesRootURI = this.realizedValue._links['variables-root'].href
      $http.post(variablesRootURI, this.result)
    }
  }

  this.setJob = function (job) {
    this.job = job
    return this
  }
}

function realizeJobAsFunction (jobObject) {
  /* eslint-disable no-new-func */
  jobObject['function'] = new Function('variable', 'context', jobObject.execute_function)
  /* eslint-enable no-new-func */
  return jobObject
}

function rejectAdministrativeLinks (link) {
  return _.contains(['self', 'api-root', 'jobs-root', 'variables-root', 'results-root'], link)
}

module.exports.client = compPoolClient
