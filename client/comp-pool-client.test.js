/* eslint-env jasmine */
/* eslint-disable no-unused-vars */
/* global angular, mediaTypeParser, linkHeaderParser */
/* eslint-enable no-unused-vars */
require('./comp-pool-client')

describe('comp-pool-client.test.js', function () {
  describe('checks parts are in place', function () {
    it('has a global variable for parsing responses', function () {
      expect(mediaTypeParser).toBeDefined()
    })

    it('has a global variable for parsing headers', function () {
      expect(linkHeaderParser).toBeDefined()
    })
  })
})
