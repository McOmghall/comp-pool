/* eslint-env jasmine */
var compPoolStats = require('./comp-pool-stats')

describe('comp-pool-stats.test.js', function () {
  describe('comp-pool-stats', function () {
    var stats

    var exampleJob1 = {
      'name': 'example-name-1'
    }

    var exampleFail = {
      'name': exampleJob1.name
    }

    var exampleJob2 = {
      'name': 'example-name-2'
    }

    beforeEach(function () {
      stats = compPoolStats.init()
    })

    it('should have stats anyway', function () {
      var current = stats.getCurrentStats()
      expect(current).toBeDefined()
      expect(current.jobs).toBe(0)
      expect(current.variables).toBe(0)
      expect(current.results).toBe(0)
      expect(current.timeSpent).toBe(0)
      expect(current.resultsPerSecond).toBe(0)
    })

    it('should check jobs have name key', function () {
      expect(function () { stats.add({}) }).toThrow()
    })

    it('should store jobs by name key', function () {
      stats.add(exampleJob1)
      expect(stats.getCurrentStats().jobs).toBe(1)
      expect(stats.getCurrentStats().variables).toBe(0)
      expect(stats.getCurrentStats().results).toBe(0)
    })

    it('should not duplicate jobs with the same key', function () {
      stats.add(exampleJob1)
      stats.add(exampleFail)
      expect(stats.getCurrentStats().jobs).toBe(1)
      expect(stats.getCurrentStats().variables).toBe(0)
      expect(stats.getCurrentStats().results).toBe(0)
    })

    it('should store multiple jobs with different key', function () {
      stats.add(exampleJob1)
      stats.add(exampleJob2)
      expect(stats.getCurrentStats().jobs).toBe(2)
      expect(stats.getCurrentStats().variables).toBe(0)
      expect(stats.getCurrentStats().results).toBe(0)
    })

    it('should store jobs related to variables', function () {
      stats.add(exampleJob1, exampleFail)
      expect(stats.getCurrentStats().jobs).toBe(1)
      expect(stats.getCurrentStats().variables).toBe(1)
      expect(stats.getCurrentStats().results).toBe(0)
    })

    it('should count correctly', function () {
      stats.add(exampleJob1, exampleFail)
      stats.add(exampleJob1, exampleFail)

      expect(Object.keys(stats.jobs.jobs).length).toBe(1)
      expect(stats.jobs.jobs[exampleJob1.name].variables.length).toBe(1)
      expect(stats.getCurrentStats().jobs).toBe(Object.keys(stats.jobs.jobs).length)
      expect(stats.getCurrentStats().variables).toBe(stats.jobs.jobs[exampleJob1.name].variables.length)
      expect(stats.getCurrentStats().results).toBe(0)
    })

    it('should store jobs and variables at the same time without duplicating', function () {
      stats.add(exampleJob1, exampleFail)
      stats.add(exampleJob1, exampleFail)
      expect(stats.getCurrentStats().jobs).toBe(1)
      expect(stats.getCurrentStats().variables).toBe(1)
      expect(stats.getCurrentStats().results).toBe(0)
    })

    it("shouldn't store variables more than once for the same job", function () {
      stats.add(exampleJob1, exampleFail)
      stats.add(exampleJob2, exampleFail)
      expect(stats.getCurrentStats().jobs).toBe(2)
      expect(stats.getCurrentStats().variables).toBe(2)
      expect(stats.getCurrentStats().results).toBe(0)
    })
  })
})
