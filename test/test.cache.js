/**
* Run (unit) tests against the Docvy Cache
*
* The MIT License (MIT)
* Copyright (c) 2015 GochoMugo <mugo@forfuture.co.ke>
*/


// built-in modules
var fs = require("fs");


// npm-installed modules
var lodash = require("lodash");
var should = require("should");


// own modules
var Cache = require("../lib/cache");
var errors = require("../lib/errors");


// module variables
var cache;
var data = require("./data/data.json");
var dataKeys = lodash.keys(data);
var nonStrings = [{}, true, false, null, undefined, [], [1],
  function() {}];


// filling cache with canned data
function fillCache(cache) {
  for (var key in data) {
    cache.set(key, data[key].content);
  }
}


// validate cache has the test data
function testCacheData(cache, done) {
  var index = 0;
  getData();

  function getData() {
    var key = dataKeys[index++];
    if (! key) { return done(); }
    cache.get(key, function(err, _data) {
      should(err).not.be.ok;
      should(_data).eql(data[key].content);
      return getData();
    });
  }
}


before(function() {
  // a cache to reuse for (simple) tests not using memory for items
  cache = new Cache({ cacheDir: __dirname + "_test_useless" });
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
    var myCache = new Cache({ cacheDir: pathToCacheDir });
    myCache.restore(function(err) {
      should(err).not.be.ok;
      testCacheData(myCache, done);
    });
  });

  it("passes RestoreError if keys file has broken JSON",
  function(done) {
    var pathToCacheDir = __dirname + "/_test_restore_broken_keysfile";
    fs.mkdirSync(pathToCacheDir);
    fs.writeFileSync(pathToCacheDir + "/keys", "{ broken: \"json\" }");
    var myCache = new Cache({ cacheDir: pathToCacheDir });
    myCache.restore(function(err) {
      should(err).be.an.instanceOf(errors.RestoreError);
      done();
    });
  });

  it("ignores if the keys file is not found", function(done) {
    var pathToCacheDir = __dirname + "/_test_has_no_keysfile";
    fs.mkdirSync(pathToCacheDir);
    var myCache = new Cache({
      cacheDir: pathToCacheDir
    });
    myCache.restore(function(err) {
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

  it("passes SaveError if could not save");

});


describe("cache.set", function() {
  var cache;

  before(function() {
    cache = new Cache({ cacheDir: __dirname + "/_test_useless" });
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

  it("waits for restoration [slow]", function(done) {
    this.timeout(5000);
    var pathToCacheDir = __dirname +
      "/_test_set_wait_on_restoration";
    var key = "some-waiting-with-set";
    var value = "some good old lumber jack";
    var myCache = new Cache({ cacheDir: pathToCacheDir });
    fillCache(myCache);
    myCache.save(function(err) {
      should(err).not.be.ok;
      myCache = new Cache({
        cacheDir: pathToCacheDir,
        waitForRestore: true
      });
      myCache.set(key, value);
      should(myCache.has(key)).eql(false);
      setTimeout(function() {
        myCache.restore(function(err) {
          should(err).not.be.ok;
          setTimeout(function() {
            should(myCache.has(key)).eql(true);
            done();
          }, 1000);
        });
      }, 1000);
    });
  });

  it("calls callback after key is set", function(done) {
    cache.set("please-call-my-callback", "some string",
    function(err) {
      should(err).not.be.ok;
      done();
    });
  });

  it("passes an InvalidKeyError if key is not a string",
  function(done) {
    var setsDone = 0;
    function amDone() {
      if (++setsDone === nonStrings.length) { done(); }
    }
    function handleRes(err) {
      should(err).be.an.instanceOf(errors.InvalidKeyError);
      amDone();
    }
    for (var index in nonStrings) {
      cache.set(nonStrings[index], "some string", handleRes);
    }
  });

  it("passes an InvalidValueError if value is not a string",
  function(done) {
    var setsDone = 0;
    function amDone() {
      if (++setsDone === nonStrings.length) { done(); }
    }
    function handleRes(err) {
      should(err).be.an.instanceOf(errors.InvalidValueError);
      amDone();
    }
    for (var index in nonStrings) {
      cache.set("my-key-forfuture", nonStrings[index], handleRes);
    }
  });

});


describe("cache.has", function() {
  var cache = new Cache();

  before(function() {
    fillCache(cache);
  });

  it("returns true if key exists", function() {
    should(cache.has(dataKeys[0])).eql(true);
  });

  it("returns false if key does NOT exist", function() {
    should(cache.has("non-existing-key")).eql(false);
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
      cache = new Cache({ cacheDir: pathToCacheDir });
      cache.restore(function(err) {
        should(err).not.be.ok;
        done();
      });
    });
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

  it("waits for restoration [slow]", function(done) {
    this.timeout(5000);
    var myCache = new Cache({
      cacheDir: pathToCacheDir,
      waitForRestore: true
    });
    var cacheWaited = false;
    myCache.get("as-string", function(err, data) {
      should(err).not.be.ok;
      should(data).be.an.instanceOf(String);
      should(cacheWaited).eql(true);
      done();
    });
    setTimeout(function() {
      myCache.restore(function(err) {
        should(err).not.be.ok;
        cacheWaited = true;
      });
    }, 1000);
  });

  it("passes an InvalidKeyError if key is not string",
  function(done) {
    var getsDone = 0;
    function amDone() {
      if (++getsDone === nonStrings.length) { done(); }
    }
    function handleRes(err) {
      should(err).be.an.instanceOf(errors.InvalidKeyError);
      amDone();
    }
    for (var index in nonStrings) {
      cache.get(nonStrings[index], handleRes);
    }
  });

  it("passes no data if it is a cache MISS", function(done) {
    cache.get("non-exisiting-key-for-real", function(err, data) {
      should(err).not.be.ok;
      should(data).eql(null);
      done();
    });
  });

});


describe("cache.unset", function() {

  it("removes item from memory", function(done) {
    var myCache = new Cache();
    var key = "in-memory-now";
    var value = "some awesome value";
    // 1st: set the item into cache
    myCache.set(key, value, function() {
      should(myCache.has(key)).eql(true);
      // 2nd: ensure it is in cache
      myCache.get(key, function(err, data) {
        should(err).not.be.ok;
        should(data).eql(value);
        // 3rd: remove from cache
        myCache.unset(key, function(err) {
          should(err).not.be.ok;
          should(myCache.has(key)).eql(false);
          done();
        });
      });
    });
  });

  it("removes its corresponding file", function(done) {
    var pathToCacheDir = __dirname + "/_test_unset_file";
    var myCache = new Cache({
      cacheDir: pathToCacheDir
    });
    var key = "got-me-a-key";
    var value = "i have some value";
    myCache.set(key, value, function(err) {
      should(err).not.be.ok;
      myCache.save(function(err) {
        should(err).not.be.ok;
        var files_1 = fs.readdirSync(pathToCacheDir);
        myCache.unset(key, function(err) {
          should(err).not.be.ok;
          var files_2 = fs.readdirSync(pathToCacheDir);
          should(files_1.length).eql(files_2.length + 1);
          done();
        }); // myCache.unset
      }); // myCache.save
    });// myCache.set
  });

  it("ignores if item does not exist yet", function(done) {
    var myCache = new Cache();
    myCache.unset("i-dont-exist", function(err) {
      should(err).not.be.ok;
      done();
    });
  });

});
