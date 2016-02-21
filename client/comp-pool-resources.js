require('angular') /*global angular*/
require('angular-hypermedia')

angular.module('compPoolResources', ['hypermedia'])
  .factory('compPoolResources', ['compPoolRoot', 'HalResource', 'Resource', 'ResourceContext', '$log', '$q',
    function (compPoolRoot, HalResource, Resource, ResourceContext, $log, $q) {
      var profileURIs = {
        root: compPoolRoot + '/profiles/root',
        job: compPoolRoot + '/profiles/job',
        variable: compPoolRoot + '/profiles/variable',
        result: compPoolRoot + '/profiles/result'
      }

      Resource.registerProfile(profileURIs.root, {
        getJob: function (jobId) {
          var job = this.$linkRel(jobId).$get()
          job.$profile = profileURIs.job
          return job
        },
        getRandomJob: function () {
          return this.getJob(pickRandomProperty(this.$links))
        }
      })

      var promiseCompPoolRoot = new ResourceContext(HalResource).get(compPoolRoot)

      return {
        getRoot: function () {
          $log.debug('Calling at comp-pool resources root ' + compPoolRoot)
          var root = promiseCompPoolRoot.$get()
            .then(function success (result) {
              $log.debug('Got root correctly: ' + JSON.stringify(result))
              result.$profile = profileURIs.root
              return result
            })
          $log.debug('Returning root successfully from resources ' + JSON.stringify(root))
          return root
        }
      }
    }
  ])

function pickRandomProperty (obj) {
  var result
  var count = 0
  for (var prop in obj) {
    if (Math.random() < 1 / ++count) {
      result = prop
    }
  }
  return result
}
