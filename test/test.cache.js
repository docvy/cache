/**
* Run (unit) tests against the Docvy Cache
*
* The MIT License (MIT)
* Copyright (c) 2015 GochoMugo <mugo@forfuture.co.ke>
*/


// npm-installed modules
var should = require("should");


// own modules
var Cache = require("../lib/cache");


// module variables
var cache;
var data = require("./data/data.json");
var dataKeys = [];


// filling cache with canned data
function fillCache(cache) {
  for (var key in data) {
    cache.set(key, data[key].content);
  }
}


// validate cache has the test data
function testCacheData(cache, done) {
  var index = 0;
  function getData() {
    var key = dataKeys[index++];
    if (! key) { return done(); }
    cache.get(key, function(err, data) {
      should(err).not.be.ok;
      should(data).eql(data[key]);
      return getData();
    });
  }
}


before(function() {
  // a cache to reuse for (simple) tests not using memory for items
  cache = new Cache({ cacheDir: __dirname + "_test_useless" });
  // data keys
  for (var key in data) { dataKeys.push(key); }
});


describe("module", function() {

  it("lets instantiating new cache from module object", function() {
    var cache = new Cache();
    should(cache).be.an.instanceOf(Cache);
    should(cache).be.an.instanceOf(Cache.Cache);
  });

});

describe("cache.Cache", function() {

  it("is a class used to instantiate new caches", function() {
    var cache = new Cache.Cache();
    should(cache).be.an.instanceOf(Cache.Cache);
  });

  it("is the same as the constructor off the module", function() {
    should(Cache.Cache).be.eql(Cache);
  });

  it("allows a config object be passed", function() {
    var configObject = { maxAge: 9853 };
    var my_cache = new Cache(configObject);
    var config = my_cache.getConfigurations();
    should(config).containEql(configObject);
  });

  it("reads default configurations from config.json", function() {
    var my_cache = new Cache();
    var config = my_cache.getConfigurations();
    should(config).containEql(require("../lib/config"));
  });

});


describe("cache.configure", function() {

  it("maxAge option sets maximum life of item", function() {
    var configObject = { maxAge: 707 };
    cache.configure(configObject);
    var config = cache.getConfigurations();
    should(config).have.a.property("maxAge");
    should(config.maxAge).eql(configObject.maxAge);
  });

  it("cacheDir option sets cache directory", function() {
    var configObject = { cacheDir: "/home/boss/lady" };
    cache.configure(configObject);
    var config = cache.getConfigurations();
    should(config).have.a.property("cacheDir");
    should(config.cacheDir).eql(configObject.cacheDir);
  });

  it("returns the cache instance", function() {
    var ret = cache.configure({});
    should(ret).eql(cache);
  });

});


describe("cache.getConfigurations", function() {

  it("returns configurations as set", function() {
    var configObject = { maxAge: 100, cacheDir: __dirname };
    cache.configure(configObject);
    var config = cache.getConfigurations();
    should(config).containEql(configObject);
  });

});


describe("cache.restore", function() {
  var cache;
  var pathToCacheDir = __dirname + "/_test_restore1";

  before(function(done) {
    cache = new Cache({
      cacheDir: pathToCacheDir
    });
    fillCache(cache);
    cache.save(function(err) {
      should(err).not.be.ok;
      done();
    });
  });

  it("restores from a directory of cache files", function(done) {
    var my_cache = new Cache({ cacheDir: pathToCacheDir });
    my_cache.restore(function(err) {
      should(err).not.be.ok;
      testCacheData(my_cache, done);
    });
  });

  it("passes No error if directory does not exist", function(done) {
    var my_cache = new Cache({
      cacheDir: __dirname + "/non-existing-dir"
    });
    cache.restore(function(err) {
      should(err).not.be.ok;
      done();
    });
  });

});


describe("cache.save", function() {
  var cache;
  var pathToCacheDir = __dirname + "/_test_save1";

  before(function() {
    cache = new Cache({
      cacheDir: pathToCacheDir
    });
    fillCache(cache);
  });

  it("saves cache to directory", function(done) {
    cache.save(function(err) {
      should(err).not.be.ok;
      var my_cache = new Cache({ cacheDir: pathToCacheDir });
      my_cache.restore(function(err) {
        should(err).not.be.ok;
        testCacheData(my_cache, done);
      });
    });
  });

});


describe("cache.set", function() {
  var cache;

  before(function() {
    cache = new Cache({ cacheDir: __dirname + "_test_useless" });
  });

  it("sets item into memory for later retrieval", function(done) {
    var someKey = "block-mine";
    var someData = "some data is useful";
    cache.set(someKey, someData);
    cache.get(someKey, function(err, data) {
      should(err).not.be.ok;
      should(data).eql(someData);
      done();
    });
  });

});


describe("cache.get", function() {
  var cache;
  var pathToCacheDir = __dirname + "/_test_get1";

  before(function(done) {
    cache = new Cache({ cacheDir: pathToCacheDir });
    fillCache(cache);
    cache.save(function(err) {
      should(err).not.be.ok;
      done();
    });
    cache = new Cache({ cacheDir: pathToCacheDir });
  });

  it("retrieves item from its file if not loaded yet", function(done) {
    testCacheData(cache, done);
  });

  it.skip("retrieves item from memory if already loaded",
  function(done) {
    cache.get("keep-in-memory", function(err, data) {
      should(err).not.be.ok;
      cache.get("keep-in-memory", function(err, data) {
        should(err).not.be.ok;
        should(data).be.ok;
        done();
      }); // inner get
    }); // outer get
  });

  it("returns data as a String", function(done) {
    cache.get("as-string", function(err, data) {
      should(err).not.be.ok;
      should(data).be.an.instanceOf(String);
      done();
    }); // cache.get
  });

});