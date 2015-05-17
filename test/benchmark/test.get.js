/**
* Run Benchmark tests against cache.get
*
* The MIT License (MIT)
* Copyright (c) 2015 GochoMugo <mugo@forfuture.co.ke>
*/

/* jshint ignore: start */


"use strict";


// own modules
var Cache = require("../../lib/cache");


// module variables
var cache = new Cache();


suite("cache", function () {
  var key = "docvy";

  set("iterations", 2169);
  set("type", "static");

  before(function(done) {
    cache.set(key, "some-content", function(err) {
      done();
    });
  });

  bench("cache.get", function(done) {
    cache.get(key, function(err, val) {
      done();
    });
  });

});

