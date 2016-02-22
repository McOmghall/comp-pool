/* global angular*/
require('angular')
require('angular-hypermedia')
require('mediatype-parser')
require('linkheader-parser')

angular
  .module('CompPoolClient', ['hypermedia'])
  .factory('compPoolClient', ['compPoolRoot', 'ResourceContext', 'HalResource', '$log', '$q', compPoolClient])

function compPoolClient (compPoolRoot, ResourceContext, HalResource, $log, $q) {
  $log.debug('Creating compPoolClient for comp-pool at %s', compPoolRoot)
  var resource = new ResourceContext(HalResource).get(compPoolRoot)
  return $q.when(Object.assign(new ApiRoot($q.when(resource))))
}

function ApiRoot (resourcePromise) {
  this.getJobsRoot = function () {
    var rootPromise = resourcePromise.then(function (resource) {
      return resource.$get()
    })
    return Object.assign(rootPromise, new JobsRoot(rootPromise))
  }
}

function JobsRoot (apiRootPromise) {
  this.getJob = function (jobId) {
    return Object.assign(apiRootPromise, new Job(apiRootPromise.$linkRel(jobId).$get()))
  }

  this.getRandomJob = function () {
    var getJob = this.getJob

    apiRootPromise.then(function (apiRoot) {
      var relsArray = Object.keys(apiRoot.$links)
      var randomLink = relsArray[Math.floor(Math.random() * relsArray.length)]
      return getJob(randomLink)
    })
  }
}

var Job = function (apiJobPromise) {}

module.exports.client = compPoolClient
