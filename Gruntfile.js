module.exports = function (grunt) {
  grunt.config('node-env', grunt.option('env') || process.env.NODE_ENV || 'development')
  grunt.log.writeln('Node env: ' + grunt.config('node-env'))

  grunt.initConfig({
    browserify: {
      test: {
        src: ['./**/*.test.js', '!./node_modules/**', '!./test/**'],
        dest: 'test/spec-bundle.js'
      }
    },
    jasmine: {
      test: {
        options: {
          specs: 'test/spec-bundle.js'
        }
      }
    }
  })

  grunt.loadNpmTasks('grunt-browserify')
  grunt.loadNpmTasks('grunt-contrib-jasmine')

  grunt.registerTask('test', ['browserify:test', 'jasmine:test'])
  grunt.registerTask('default', ['test'])
}
