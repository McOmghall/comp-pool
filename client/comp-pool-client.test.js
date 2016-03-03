/* eslint-env jasmine */
/* global angular*/
require('angular')
require('angular-mocks')
require('./comp-pool-client')

describe('comp-pool-client.test.js', function () {
  describe('can test', function () {
    it('ensures jasmine is present', function () {
      expect(true).toBeTruthy()
    })

    it('ensures angular is present', function () {
      expect(angular).toBeDefined()
      expect(angular.mock).toBeDefined()
      expect(angular.mock.module).toBeDefined()
      expect(angular.mock.inject).toBeDefined()

      var logTest
      angular.mock.inject(function (_$log_) {
        logTest = _$log_
      })

      expect(logTest).toBeDefined()
      expect(logTest.debug).toBeDefined()
    })

    it('ensures ECMAScript 6 needed polyfills', function () {
      expect(Object.assign).toBeDefined()
      expect(Object.assign({}, {a: 'a'})).toEqual({a: 'a'})
    })
  })

  describe('test client getting objects', function () {
    var $httpBackend
    var compPoolClient

    beforeEach(function () {
      angular.mock.module('CompPoolClient')
      var compPoolRoot = 'http://localhost:8080/'
      var jobsRoot = compPoolRoot + 'jobs'
      var aJobRoot = jobsRoot + '/example-job'
      var variablesRootForaJob = aJobRoot + '/variables'
      var aVariable = variablesRootForaJob + '/1'
      angular.mock.module(function ($provide) {
        var apiRootData = {
          _links: {
            'api-root': {'href': compPoolRoot},
            'jobs-root': {'href': jobsRoot}
          }
        }
        var jobsRootData = apiRootData
        jobsRootData._links.jobs = {'href': aJobRoot}

        var jobData = jobsRootData
        jobData._links['variables-root'] = {'href': variablesRootForaJob}
        jobData = Object.assign(jobData, {
          'name': 'example-job',
          'execute_function': 'return (function (variable, context) {return context})(variable, context)',
          'metadata': {
            'description': {
              'en': 'An example job that does nothing'
            },
            'owner': 'semprebeta'
          }
        })
        var variablesRootData = jobsRootData
        variablesRootData._links['variables-root'] = {'href': variablesRootForaJob}
        variablesRootData._links.variables = {'href': aVariable}
        var aVariableData = variablesRootData
        aVariableData.for_jobs = ['example-job']
        aVariableData.variable = {'example-field-name': 'example-value'}
        $provide.value('compPoolRoot', compPoolRoot)
        $provide.value('serverData', {
          apiRoot: apiRootData,
          jobsRoot: jobsRootData,
          job: jobData,
          variablesRoot: variablesRootData,
          variable: aVariableData
        })
      })

      angular.mock.inject(function (_$httpBackend_, _compPoolClient_, compPoolRoot, serverData) {
        $httpBackend = _$httpBackend_
        $httpBackend.whenRoute('GET', compPoolRoot).respond(200, JSON.stringify(serverData.apiRoot))
        $httpBackend.whenRoute('GET', jobsRoot).respond(200, JSON.stringify(serverData.jobsRoot))
        $httpBackend.whenRoute('GET', aJobRoot).respond(200, JSON.stringify(serverData.job))
        $httpBackend.whenRoute('GET', variablesRootForaJob).respond(200, JSON.stringify(serverData.variablesRoot))
        $httpBackend.whenRoute('GET', aVariable).respond(200, JSON.stringify(serverData.variable))
        compPoolClient = _compPoolClient_
      })
    })

    it('should connect at startup (get api root)', angular.mock.inject(function (serverData) {
      var apiRoot
      expect(compPoolClient).toBeDefined()
      compPoolClient.then(function (apiRootInPromise) {
        apiRoot = apiRootInPromise
      })
      $httpBackend.flush(1)
      expect(apiRoot).toEqual(jasmine.objectContaining(serverData.apiRoot))
      expect(apiRoot._links['jobs-root']).toBeDefined()
      expect(apiRoot._links['jobs-root']).toEqual(serverData.apiRoot._links['jobs-root'])
    }))

    it('should get the jobs root through function chains', angular.mock.inject(function (serverData) {
      var jobsRoot1
      compPoolClient.getJobsRoot().then(function (jobsRoot) {
        jobsRoot1 = jobsRoot
      })
      $httpBackend.flush(2)

      expect(jobsRoot1).toEqual(jasmine.objectContaining(serverData.jobsRoot))
    }))

    it('should get the jobs root through promises', angular.mock.inject(function (serverData) {
      var jobsRoot1
      compPoolClient.then(function (apiRoot) {
        return apiRoot.getJobsRoot()
      }).then(function (jobsRoot) {
        jobsRoot1 = jobsRoot
      })
      $httpBackend.flush(2)

      expect(jobsRoot1).toEqual(jasmine.objectContaining(serverData.jobsRoot))
    }))

    it('should get the jobs root through promises or function chains', angular.mock.inject(function (serverData) {
      var jobsRoot1
      var jobsRoot2
      compPoolClient.getJobsRoot().then(function (jobsRoot) {
        jobsRoot1 = jobsRoot
      })
      compPoolClient.then(function (apiRoot) {
        return apiRoot.getJobsRoot()
      }).then(function (jobsRoot) {
        jobsRoot2 = jobsRoot
      })
      $httpBackend.flush(3)

      expect(jobsRoot1).toEqual(jobsRoot2)
      expect(jobsRoot1).toEqual(jasmine.objectContaining(serverData.jobsRoot))
      expect(jobsRoot2).toEqual(jasmine.objectContaining(serverData.jobsRoot))
    }))

    it('should get a job through promises', angular.mock.inject(function (serverData) {
      var job1
      compPoolClient.then(function (apiRoot) {
        return apiRoot.getJobsRoot()
      }).then(function (jobsRoot) {
        return jobsRoot.getRandomJob()
      }).then(function (job) {
        job1 = job
      })
      $httpBackend.flush(3)

      expect(job1).toEqual(jasmine.objectContaining(serverData.job))
    }))

    it('should get a job through function chains', angular.mock.inject(function (serverData) {
      var job1
      compPoolClient.getJobsRoot().getRandomJob().then(function (job) {
        job1 = job
      })
      $httpBackend.flush(3)

      expect(job1).toEqual(jasmine.objectContaining(serverData.job))
    }))

    it('should get a job through promises or function chains', angular.mock.inject(function (serverData) {
      var job1
      var job2
      compPoolClient.getJobsRoot().getRandomJob().then(function (job) {
        job1 = job
      })
      compPoolClient.then(function (apiRoot) {
        return apiRoot.getJobsRoot()
      }).then(function (jobsRoot) {
        return jobsRoot.getRandomJob()
      }).then(function (job) {
        job2 = job
      })
      $httpBackend.flush(5)

      expect(job1).toEqual(job2)
      expect(job1).toEqual(jasmine.objectContaining(serverData.job))
      expect(job2).toEqual(jasmine.objectContaining(serverData.job))
    }))

    it('should get a variable through promises', angular.mock.inject(function (serverData) {
      var variable1
      compPoolClient.then(function (apiRoot) {
        return apiRoot.getJobsRoot()
      }).then(function (jobsRoot) {
        return jobsRoot.getRandomJob()
      }).then(function (job) {
        return job.getVariablesRoot()
      }).then(function (variablesRoot) {
        return variablesRoot.getRandomVariable()
      }).then(function (variable) {
        variable1 = variable
      })
      $httpBackend.flush(5)

      expect(variable1).toEqual(jasmine.objectContaining(serverData.variable))
    }))

    it('should get a variable through function chains', angular.mock.inject(function (serverData) {
      var variable1
      compPoolClient.getJobsRoot().getRandomJob().getVariablesRoot().getRandomVariable().then(function (variable) {
        variable1 = variable
      })
      $httpBackend.flush(5)

      expect(variable1).toEqual(jasmine.objectContaining(serverData.variable))
    }))

    it('should be able to compute through promises', angular.mock.inject(function (serverData) {
      var computedVariable
      compPoolClient.then(function (apiRoot) {
        return apiRoot.getJobsRoot()
      }).then(function (jobsRoot) {
        return jobsRoot.getRandomJob()
      }).then(function (job) {
        return job.getVariablesRoot()
      }).then(function (variablesRoot) {
        return variablesRoot.getRandomVariable()
      }).then(function (variable) {
        return variable.compute()
      }).then(function (variable) {
        computedVariable = variable
      })
      $httpBackend.flush(5)

      expect(computedVariable.result).toBeDefined()
    }))

    it('should be able to compute through function chains', angular.mock.inject(function (serverData) {
      var computedVariable
      compPoolClient.getJobsRoot().getRandomJob().getVariablesRoot().getRandomVariable().compute().then(function (variable) {
        computedVariable = variable
      })
      $httpBackend.flush(5)

      expect(computedVariable.result).toBeDefined()
    }))
  })
})
