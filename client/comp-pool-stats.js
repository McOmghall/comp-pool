var CompPoolStats = function () {
  this.instantiationTime = Date.now()
  this.jobs = new JobStatsCollector()
  this.timeOfFirstJob = null

  this.add = function (job, variable, result) {
    if (!this.timeOfFirstJob && job) {
      this.timeOfFirstJob = Date.now()
    }
    this.jobs.addJob(job)
    this.jobs.addVariable(job, variable)
    this.jobs.addResult(job, variable, result)
  }

  this.getCurrentStats = function () {
    var timeSpent = (this.timeOfFirstJob == null ? 0 : (Date.now() - this.timeOfFirstJob) / 1000)
    var counts = this.jobs.counts()
    var resultsPerSecond = (this.timeOfFirstJob == null ? 0 : counts.results / (timeSpent / 1000))
    return {
      jobs: counts.jobs,
      variables: counts.variables,
      results: counts.results,
      timeSpent: timeSpent,
      resultsPerSecond: resultsPerSecond
    }
  }
}

function JobStatsCollector () {
  this.jobs = {}

  this.isJob = function (job) {
    return !(job.name == null || typeof job.name !== 'string' || job.name === '')
  }

  this.throwExceptionIfNotJob = function (job) {
    if (!this.isJob(job)) {
      throw new NotAJobException(job)
    }
  }

  this.throwExceptionIfNotVariable = function (variable) {
    if (typeof variable !== 'object') {
      throw new NotAVariableException(variable)
    }
  }
  this.throwExceptionIfNotResult = function (result) {}

  this.addJob = function (job) {
    this.throwExceptionIfNotJob(job)
    if (this.jobs[job.name] == null) {
      this.jobs[job.name] = job
    }
  }

  this.jobHasVariable = function (job, variable) {
    var variableNoResults = JSON.parse(JSON.stringify(variable))
    variableNoResults.results = null

    for (var element in job.variables) {
      var elementNoResults = JSON.parse(JSON.stringify(element))
      elementNoResults.results = null
      if (JSON.stringify(variableNoResults) === JSON.stringify(elementNoResults)) {
        return true
      }
    }

    return false
  }

  this.addVariable = function (job, variable) {
    this.throwExceptionIfNotJob(job)

    if (variable == null) {
      return
    }
    this.throwExceptionIfNotVariable(variable)

    if (this.jobs[job.name].variables && !this.jobHasVariable(this.jobs[job.name], variable)) {
      this.jobs[job.name].variables.push(variable)
    } else {
      this.jobs[job.name].variables = [variable]
    }
  }

  this.addResult = function (job, variable, result) {
    this.throwExceptionIfNotJob(job)
  }

  this.counts = function () {
    var jobCount = 0
    var variableCount = 0
    var resultCount = 0

    for (var job in this.jobs) {
      jobCount++
      for (var variable in this.jobs[job].variables || []) {
        variableCount++
        resultCount += (variable.results || []).length
      }
    }

    return {
      jobs: jobCount,
      variables: variableCount,
      results: resultCount
    }
  }
}

function NotAJobException (job) {
  this.message = 'Not a valid job, job.name is not a valid key: ' + JSON.stringify(job)
  this.cause = job
}

function NotAVariableException (variable) {
  this.message = 'Not a valid variable, must be an object (was ' + typeof variable + ')'
  this.cause = variable
}

module.exports.init = function () {
  return new CompPoolStats()
}
