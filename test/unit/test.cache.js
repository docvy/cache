/**
 * Run (unit) tests against the Docvy Cache
 *
 * The MIT License (MIT)
 * Copyright (c) 2015 GochoMugo <mugo@forfuture.co.ke>
 */


"use strict";


// built-in modules
var fs = require("fs");
var path = require("path");


// npm-installed modules
var _ = require("lodash");
var rooted = require("rooted");
var should = require("should");


// own modules
var Cache = rooted("lib/cache");
var errors = rooted("lib/errors");


// module variables
var testcache;
var data = require("./data/data.json");
var dataKeys = _.keys(data);
var nonStrings = [{ }, true, false, null, undefined, [], [1], function() { }];


// filling cache with canned data
function fillCache(c) {
  for (var key in data) {
    c.set(key, data[key].content);
  }
}


// validate cache has the test data
function testCacheData(cache, done) {
  var index = 0;
  return getData();

  function getData() {
    var key = dataKeys[index++];
    if (!key) {
      return done();
    }
    cache.get(key, function(err, _data) {
      should(err).not.be.ok();
      should(_data).eql(data[key].content);
      return getData();
    });
  }
}


before(function() {
  // a cache to reuse for (simple) tests not using memory for items
  testcache = new Cache({ cacheDir: path.join(__dirname, "_test_useless") });
});


describe("module", function() {
  it("lets instantiating new cache from module object", function() {
    var c = new Cache();
    should(c).be.an.instanceOf(Cache);
    should(c).be.an.instanceOf(Cache.Cache);
  });
});


describe("cache.Cache", function() {
  it("is a class used to instantiate new caches", function() {
    var c = new Cache.Cache();
    should(c).be.an.instanceOf(Cache.Cache);
  });

  it("is the same as the constructor off the module", function() {
    should(Cache.Cache).be.eql(Cache);
  });

  it("allows a config object be passed", function() {
    var configObject = { maxAge: 9853 };
    var c = new Cache(configObject);
    var config = c.getConfigurations();
    should(config).containEql(configObject);
  });

  it("reads default configurations from config.json", function() {
    var c = new Cache();
    var config = c.getConfigurations();
    should(config).containEql(rooted("lib/config"));
  });

});


describe("cache.configure", function() {
  it("maxAge option sets maximum life of item", function() {
    var configObject = { maxAge: 707 };
    testcache.configure(configObject);
    var config = testcache.getConfigurations();
    should(config).have.a.property("maxAge");
    should(config.maxAge).eql(configObject.maxAge);
  });

  it("cacheDir option sets cache directory", function() {
    var configObject = { cacheDir: "/home/boss/lady" };
    testcache.configure(configObject);
    var config = testcache.getConfigurations();
    should(config).have.a.property("cacheDir");
    should(config.cacheDir).eql(configObject.cacheDir);
  });

  it("returns the cache instance", function() {
    var ret = testcache.configure({});
    should(ret).eql(testcache);
  });
});


describe("cache.getConfigurations", function() {
  it("returns configurations as set", function() {
    var configObject = { maxAge: 100, cacheDir: __dirname };
    testcache.configure(configObject);
    var config = testcache.getConfigurations();
    should(config).containEql(configObject);
  });
});


describe("cache.restore", function() {
  var cache;
  var pathToCacheDir = path.join(__dirname, "/_test_restore1");

  before(function(done) {
    cache = new Cache({
      cacheDir: pathToCacheDir,
    });
    fillCache(cache);
    cache.save(function(err) {
      should(err).not.be.ok();
      done();
    });
  });

  it("restores from a directory of cache files", function(done) {
    var myCache = new Cache({ cacheDir: pathToCacheDir });
    myCache.restore(function(err) {
      should(err).not.be.ok();
      testCacheData(myCache, done);
    });
  });

  it("passes RestoreError if keys file has broken JSON",
  function(done) {
    var cachedirPath = path.join(__dirname, "/_test_restore_broken_keysfile");
    fs.mkdirSync(cachedirPath);
    fs.writeFileSync(cachedirPath + "/keys", "{ broken: \"json\" }");
    var myCache = new Cache({ cacheDir: pathToCacheDir });
    myCache.restore(function(err) {
      should(err).be.an.instanceOf(errors.RestoreError);
      done();
    });
  });

  it("ignores if the keys file is not found", function(done) {
    var cachedirPath = path.join(__dirname, "/_test_has_no_keysfile");
    fs.mkdirSync(cachedirPath);
    var myCache = new Cache({
      cacheDir: cachedirPath,
    });
    myCache.restore(function(err) {
      should(err).not.be.ok();
      done();
    });
  });
});


describe("cache.save", function() {
  var cache;
  var pathToCacheDir = path.join(__dirname, "/_test_save1");

  before(function() {
    cache = new Cache({
      cacheDir: pathToCacheDir,
    });
    fillCache(cache);
  });

  it("saves cache to directory", function(done) {
    cache.save(function(err) {
      should(err).not.be.ok();
      var c = new Cache({ cacheDir: pathToCacheDir });
      c.restore(function(restoreErr) {
        should(restoreErr).not.be.ok();
        testCacheData(c, done);
      });
    });
  });

  it("passes SaveError if could not save");
});


describe("cache.set", function() {
  var cache;

  before(function() {
    cache = new Cache({ cacheDir: path.join(__dirname, "/_test_set") });
  });

  it("sets item into memory for later retrieval", function(done) {
    var someKey = "block-mine";
    var someData = "some data is useful";
    cache.set(someKey, someData);
    cache.get(someKey, function(getErr, d) {
      should(getErr).not.be.ok();
      should(d).eql(someData);
      done();
    });
  });

  it("waits for restoration [slow]", function(done) {
    this.timeout(5000);
    var cachedirPath = path.join(__dirname, "/_test_set_wait_on_restoration");
    var key = "some-waiting-with-set";
    var value = "some good old lumber jack";
    var myCache = new Cache({ cacheDir: cachedirPath });
    fillCache(myCache);
    myCache.save(function(err) {
      should(err).not.be.ok();
      myCache = new Cache({
        cacheDir: cachedirPath,
        waitForRestore: true,
      });
      myCache.set(key, value);
      should(myCache.has(key)).eql(false);
      setTimeout(function() {
        myCache.restore(function(restoreErr) {
          should(restoreErr).not.be.ok();
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
      should(err).not.be.ok();
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

  it("allows setting ttl for new items", function(done) {
    var key = "awk-hey";
    var maxAge = 100;
    cache.set(key, "content", { maxAge: maxAge }, function(err) {
      should(err).not.be.ok();
      setTimeout(function() {
        cache.refresh(function(refreshErr) {
          should(refreshErr).not.be.ok();
          cache.get(key, function(getErr, val) {
            should(getErr).not.be.ok();
            should(val).not.be.ok();
            done();
          }); // cache.get
        }); // cache.refresh
      }, maxAge * 3); // setTimeout
    }); // cache.set
  });

  it("ignores adding ttl for existing items", function(done) {
    var key = "awk-key";
    var content = "some-cotennt";
    var maxAge = 100;
    cache.set(key, "random", function(err) {
      should(err).not.be.ok();
      cache.set(key, content, { maxAge: maxAge }, function(setErr) {
        should(setErr).not.be.ok();
        setTimeout(function() {
          cache.refresh(function(refreshErr) {
            should(refreshErr).not.be.ok();
            cache.get(key, function(getErr, val) {
              should(getErr).not.be.ok();
              should(val).eql(content);
              done();
            }); // cache.get
          }); // cache.refresh
        }, maxAge * 3); // setTimeout
      }); // cache.set
    }); // cache.set
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
  var pathToCacheDir = path.join(__dirname, "/_test_get1");

  before(function(done) {
    cache = new Cache({ cacheDir: pathToCacheDir });
    fillCache(cache);
    cache.save(function(err) {
      should(err).not.be.ok();
      cache = new Cache({ cacheDir: pathToCacheDir });
      cache.restore(function(restoreErr) {
        should(restoreErr).not.be.ok();
        done();
      });
    });
  });

  it("retrieves item from its file if not loaded yet", function(done) {
    testCacheData(cache, done);
  });

  it.skip("retrieves item from memory if already loaded", function(done) {
    cache.get("keep-in-memory", function(getErr) {
      should(getErr).not.be.ok();
      cache.get("keep-in-memory", function(getErr2, d) {
        should(getErr2).not.be.ok();
        should(d).be.ok();
        done();
      }); // inner get
    }); // outer get
  });

  it("returns data as a String", function(done) {
    cache.get("as-string", function(getErr, d) {
      should(getErr).not.be.ok();
      should(d).be.an.instanceOf(String);
      done();
    }); // cache.get
  });

  it("waits for restoration [slow]", function(done) {
    this.timeout(5000);
    var myCache = new Cache({
      cacheDir: pathToCacheDir,
      waitForRestore: true,
    });
    var cacheWaited = false;
    myCache.get("as-string", function(getErr, d) {
      should(getErr).not.be.ok();
      should(d).be.an.instanceOf(String);
      should(cacheWaited).eql(true);
      done();
    });
    setTimeout(function() {
      myCache.restore(function(err) {
        should(err).not.be.ok();
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
    cache.get("non-exisiting-key-for-real", function(getErr, d) {
      should(getErr).not.be.ok();
      should(d).eql(null);
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
      myCache.get(key, function(getErr, d) {
        should(getErr).not.be.ok();
        should(d).eql(value);
        // 3rd: remove from cache
        myCache.unset(key, function(err) {
          should(err).not.be.ok();
          should(myCache.has(key)).eql(false);
          done();
        });
      });
    });
  });

  it("removes its corresponding file", function(done) {
    var pathToCacheDir = path.join(__dirname, "/_test_unset_file");
    var myCache = new Cache({
      cacheDir: pathToCacheDir,
    });
    var key = "got-me-a-key";
    var value = "i have some value";
    myCache.set(key, value, function(err) {
      should(err).not.be.ok();
      myCache.save(function(saveErr) {
        should(saveErr).not.be.ok();
        var files1 = fs.readdirSync(pathToCacheDir);
        myCache.unset(key, function(unsetErr) {
          should(unsetErr).not.be.ok();
          var files2 = fs.readdirSync(pathToCacheDir);
          should(files1.length).eql(files2.length + 1);
          done();
        }); // myCache.unset
      }); // myCache.save
    });// myCache.set
  });

  it("ignores if item does not exist yet", function(done) {
    var myCache = new Cache();
    myCache.unset("i-dont-exist", function(err) {
      should(err).not.be.ok();
      done();
    });
  });

});


describe("cache.destroy", function() {
  var cache;
  var pathToCacheDir = path.join(__dirname, "/_test_destroy1");

  before(function(done) {
    cache = new Cache({ cacheDir: pathToCacheDir });
    fillCache(cache);
    cache.save(function(err) {
      should(err).not.be.ok();
      done();
    });
  });

  it("removes entire cacheDir", function(done) {
    cache.destroy(function(err) {
      should(err).not.be.ok();
      should(fs.existsSync(pathToCacheDir)).eql(false);
      done();
    });
  });

});


describe("cache.refresh", function() {
  var cache;
  var pathToCacheDir = path.join(__dirname, "/_test_refresh1");

  before(function() {
    cache = new Cache({
      cacheDir: pathToCacheDir,
      maxAge: 100,
    });
  });

  it("removes expired items", function(done) {
    var key = "expire";
    var value = "some content";
    cache.set(key, value, function(err) {
      should(err).not.be.ok();
      cache.get(key, function(getErr, val) {
        should(getErr).not.be.ok();
        should(val).eql(value);
        setTimeout(function() {
          cache.refresh(function(refreshErr) {
            should(refreshErr).not.be.ok();
            cache.get(key, function(getErr2, val2) {
              should(getErr2).not.be.ok();
              should(val2).not.be.ok();
              done();
            }); // cache.get
          }); // cache.refresh
        }, 200); // setTimeout
      }); // cache.get
    }); // cache.set
  });

});
