module.exports = new function () {
  this.realizeJobAsFunction = function (jobObject) {
    /* eslint-disable no-new-func */
    jobObject['function'] = new Function('variable', 'context', jobObject.execute_function)
    /* eslint-enable no-new-func */
    return jobObject
  }

  this.randomLinkIn = function (links) {
    var relsArray = [].concat(links)
    var randomLink = relsArray[Math.floor(Math.random() * relsArray.length)]
    return randomLink
  }
}
