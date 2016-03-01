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
      angular.mock.module(function ($provide) {
        var apiRootData = {
          _links: {
            'api-root': {'href': compPoolRoot},
            'jobs-root': {'href': jobsRoot}
          }
        }
        var jobsRootData = Object.assign({_links: {'jobs': {'example-job': {'href': aJobRoot}}}}, apiRootData)
        $provide.value('compPoolRoot', compPoolRoot)
        $provide.value('serverData', {
          apiRoot: apiRootData,
          jobsRoot: jobsRootData
        })
      })

      angular.mock.inject(function (_$httpBackend_, _compPoolClient_, compPoolRoot, serverData) {
        $httpBackend = _$httpBackend_
        $httpBackend.whenRoute('GET', compPoolRoot).respond(200, JSON.stringify(serverData.apiRoot))
        $httpBackend.whenRoute('GET', jobsRoot).respond(200, JSON.stringify(serverData.jobsRoot))
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

    it('should get the jobs root through promises or function chains, whatever is more confortable to the user', angular.mock.inject(function (serverData) {
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
  })
})
