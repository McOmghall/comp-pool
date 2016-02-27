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

  describe('test client', function () {
    var $httpBackend
    var compPoolClient
    beforeEach(function () {
      angular.mock.module('CompPoolClient')
      angular.mock.module(function ($provide) {
        $provide.value('compPoolRoot', 'http://localhost:8080/')
      })
      angular.mock.inject(function (_$httpBackend_, _compPoolClient_, compPoolRoot) {
        $httpBackend = _$httpBackend_
        $httpBackend.whenRoute('GET', compPoolRoot).respond(200, '')
        compPoolClient = _compPoolClient_
      })
    })

    afterEach(function () {
      $httpBackend.flush()
    })

    it('should connect at startup', angular.mock.inject(function ($rootScope) {
      $rootScope.$apply()
      expect(compPoolClient).toBeDefined()
    }))
  })
})
