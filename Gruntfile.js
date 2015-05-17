/**
* Run script for Grunt, task runner
*
* The MIT License (MIT)
* Copyright (c) 2015 GochoMugo <mugo@forfuture.co.ke>
*/


exports = module.exports = function(grunt) {
  "use strict";

  grunt.initConfig({
    clean: {
      test: {
        src: ["test/**/_test*"]
      }
    },
    jshint: {
      all: [
        "Gruntfile.js", "lib/**/*.js", "test/**/*.js"
      ],
      options: {
        jshintrc: true
      }
    },
    mochaTest: {
      test: {
        options: {
          reporter: 'spec',
          quiet: false,
          clearRequireCache: false
        },
        src: ["test/unit/test.*.js"]
      }
    }
  });

  grunt.loadNpmTasks("grunt-contrib-clean");
  grunt.loadNpmTasks("grunt-contrib-jshint");
  grunt.loadNpmTasks("grunt-mocha-test");

  grunt.registerTask("test", ["jshint", "clean", "mochaTest", "clean"]);

};
