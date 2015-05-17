/**
* Run tests for memory leaks
*
* The MIT License (MIT)
* Copyright (c) 2015 GochoMugo <mugo@forfuture.co.ke>
*/


// built-in modules
var fs = require("fs");


// npm-installed modules
var lodash = require("lodash");
var memwatch = require("memwatch");
var should = require("should");


// own modules
var Cache = require("../../lib/cache");


// module variables
var data = require("./data/data");
var testTimeout = 0;


/**
* Fill cache
*/
function fillCache(cache, marker, done) {
  for (var key in data) {
    cache.set(key + marker, data[key], done);
  }
}


/**
* Highly load the cache
*/
function loadCache(cache, done) {
  var set = 0;
  var maximum = 1000 * 10;
  for (var rounds = 0; rounds < maximum; rounds++) {
    fillCache(cache, rounds, next);
  }
  function next() {
    set++;
    if (set === maximum) { return done(); }
  }
}


describe.skip("cache.destroy", function() {
  this.timeout(testTimeout);
  var cache;

  it("removes items from in-memory", function(done) {
    // take 1st snapshot before filling cache
    var hd = new memwatch.HeapDiff();

    cache = new Cache();
    var diff1, diff2;
    loadCache(cache, function() {
      // take second snapshot while cache is loaded
      diff1 = hd.end();

      // start a new snapshot before destroying cache
      hd = new memwatch.HeapDiff();
      cache.destroy(function(err) {
        should(err).not.be.ok;
        // take third snapshot after cache destroying
        diff2 = hd.end();
        console.log(diff1);
        console.log(diff2);
        done();
      });    
    });
    
  });

});
