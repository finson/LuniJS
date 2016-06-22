module.exports = function(grunt) {

  // Project configuration.
  grunt.initConfig({
    pkg: grunt.file.readJSON('package.json'),
    jshint: {
      options: {
        esversion: 6,
        // bitwise: true,
        curly: true,
        eqeqeq: true,
        nonew: true,
        notypeof: true,
        shadow: "outer",
        // undef: true,
        unused: true,
        varstmt: true
      },
      lib: {
        src: ['lib/*.js','lib/RDD/*.js']
      }
    }
  });

  // Load plugins
  grunt.loadNpmTasks('grunt-contrib-jshint');

  // Define default task(s).
  grunt.registerTask('default', ['jshint']);

};
