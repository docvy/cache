/**
 * Run script for Grunt, task runner
 *
 * The MIT License (MIT)
 * Copyright (c) 2015 GochoMugo <mugo@forfuture.co.ke>
 */


"use strict";


exports = module.exports = function(grunt) {
  require("load-grunt-tasks")(grunt);

  grunt.initConfig({
    benchmark: {
      all: {
        src: ["test/benchmark/test.*.js"],
        dest: "test/benchmark/results.csv",
      },
    },
    clean: {
      test: {
        src: ["test/**/_test*"],
      },
    },
    eslint: {
      src: ["Gruntfile.js", "index.js", "lib/**/*.js"],
      test: ["test/**/*.js"],
    },
    mochaTest: {
      test: {
        options: {
          reporter: "spec",
          quiet: false,
          clearRequireCache: false,
        },
        src: ["test/unit/test.*.js"],
      },
    },
  });

  grunt.registerTask("test", ["clean", "eslint", "mochaTest", "benchmark", "clean"]);
};
