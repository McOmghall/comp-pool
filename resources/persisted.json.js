/**
 * persisted.json.js
 * Objects to be loaded on startup
 */

module.exports.jobs = [{
  'name': 'hash-of-hashes',
  'execute_function': 'return (function (variable, context) {var hash = 0, i, chr, len; if (variable.hash && variable.hash.length == 0) return hash;for (i = 0, len = variable.hash.length; i < len; i++) {chr = variable.hash.charCodeAt(i);hash  = ((hash << 5) - hash) + chr;hash |= 0;}return hash;})(variable, context)',
  'metadata': {
    'description': {
      'en': 'Computes the hashcode of a provided variable.hash'
    },
    'owner': 'semprebeta'
  }
}]

module.exports.variables = [{
  for_job: ['hash-of-hashes'],
  variable: {
    hash: 'iamdefault'
  }
}]

module.exports.results = []
