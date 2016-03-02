/* global angular*/
require('angular')
var realizeJobAsFunction = require('./comp-pool-aux').realizeJobAsFunction
var randomLinkIn = require('./comp-pool-aux').randomLinkIn

Object.assign = Object.assign || require('object.assign').getPolyfill()

angular
  .module('CompPoolClient', [])
  .service('ApiRoot', ['JobsRoot', '$http', '$log', ApiRoot])
  .service('JobsRoot', ['Job', '$http', '$log', JobsRoot])
  .service('Job', ['VariablesRoot', '$http', '$log', Job])
  .service('VariablesRoot', ['Variable', '$http', '$log', VariablesRoot])
  .service('Variable', ['$http', '$log', Variable])
  .factory('compPoolClient', ['compPoolRoot', 'ApiRoot', '$http', '$log', compPoolClient])

function compPoolClient (compPoolRoot, ApiRoot, $http, $log) {
  $log.debug('Creating compPoolClient for comp-pool at %s', compPoolRoot)
  var apiRootPromise = $http.get(compPoolRoot).then(function (apiRoot) {
    $log.debug('Got api root %j', apiRoot)
    return Object.assign(ApiRoot.actual(apiRoot.data), apiRoot.data)
  })
  return Object.assign(apiRootPromise, ApiRoot)
}

function Actualizable () {}
Actualizable.prototype.actual = function (value) {
  this.realizedValue = value

  return this
}

ApiRoot.prototype = Object.create(Actualizable.prototype)
function ApiRoot (JobsRoot, $http, $log) {
  Actualizable.call(this)

  this.getJobsRoot = function () {
    $log.debug('Getting jobs root with %j > %j', this, this.realizedValue)
    if (this.realizedValue == null) {
      return Object.assign(this.then(function (apiRoot) {
        return apiRoot.getJobsRoot()
      }), JobsRoot)
    }
    var jobsRoot = this.realizedValue._links['jobs-root'].href

    var jobsRootPromise = $http.get(jobsRoot).then(function (jobsRoot) {
      $log.debug('Got jobs root %j', jobsRoot)
      return Object.assign(JobsRoot.actual(jobsRoot.data), jobsRoot.data)
    })
    return Object.assign(jobsRootPromise, JobsRoot)
  }
}

JobsRoot.prototype = Object.create(Actualizable.prototype)
function JobsRoot (Job, $http, $log) {
  Actualizable.call(this)

  this.getJobFromLink = function (jobLink) {
    var jobPromise = $http.get(jobLink).then(function (job) {
      $log.debug('Got job %j', job)
      return Object.assign(Job.actual(job.data), job.data)
    })
    return Object.assign(jobPromise, Job)
  }

  this.getJob = function (jobId) {
    $log.debug('Getting a job by id %s', jobId)
    if (this.realizedValue == null) {
      return Object.assign(this.then(function (jobRoot) {
        return jobRoot.getJob(jobId)
      }), Job)
    }

    return this.getJobFromLink(this.realizedValue._links.jobs[jobId].href)
  }

  this.getRandomJob = function () {
    $log.debug('Getting a random job with %j > %j', this, this.realizedValue)
    if (this.realizedValue == null) {
      return Object.assign(this.then(function (jobRoot) {
        return jobRoot.getRandomJob()
      }), Job)
    }

    return this.getJobFromLink(randomLinkIn(this.realizedValue._links.jobs).href)
  }
}

Job.prototype = Object.create(Actualizable.prototype)
function Job (VariablesRoot, $http, $log) {
  Actualizable.call(this)

  this.getVariablesRoot = function () {
    $log.debug('Getting a variables root with %j > %j', this, this.realizedValue)
    if (this.realizedValue == null) {
      return Object.assign(this.then(function (job) {
        return job.getVariablesRoot()
      }), VariablesRoot)
    }

    var variablesRoot = this.realizedValue._links['variables-root'].href

    VariablesRoot.setJob(this.realizedValue)
    var variablesRootPromise = $http.get(variablesRoot).then(function (variablesRoot) {
      $log.debug('Got variables root %j for job %j', variablesRoot, VariablesRoot.job)
      return Object.assign(VariablesRoot.actual(variablesRoot.data), variablesRoot.data)
    })
    return Object.assign(variablesRootPromise, VariablesRoot)
  }
}

VariablesRoot.prototype = Object.create(Actualizable.prototype)
function VariablesRoot (Variable, $http, $log) {
  Actualizable.call(this)
  this.job = null

  this.getVariableFromLink = function (variableLink) {
    Variable.setJob(this.job)
    var variablePromise = $http.get(variableLink).then(function (variable) {
      $log.debug('Got variable %j for job %j', variable, Variable.job)
      return Object.assign(Variable.actual(variable.data), variable.data)
    })
    return Object.assign(variablePromise, Variable)
  }

  this.getVariable = function (variableId) {
    $log.debug('Getting a variable by id %s', variableId)
    if (this.realizedValue == null) {
      return Object.assign(this.then(function (variable) {
        return variable.getVariable(variableId)
      }), Variable)
    }

    return this.getVariableFromLink(this.realizedValue._links.variables[variableId].href)
  }

  this.getRandomVariable = function () {
    $log.debug('Getting a random variable with %j > %j', this, this.realizedValue)
    if (this.realizedValue == null) {
      return Object.assign(this.then(function (variableRoot) {
        return variableRoot.getRandomVariable()
      }), Variable)
    }

    return this.getVariableFromLink(randomLinkIn(this.realizedValue._links.variables).href)
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
      return Object.assign(this.then(function (variable) {
        return variable.compute()
      }), this)
    }

    realizeJobAsFunction(this.job)
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

module.exports.client = compPoolClient
