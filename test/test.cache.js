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


// a cache to reuse for (simple) tests not using memory for items
before(function() {
  cache = new Cache();
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

  it("restores from a directory of cache files");

});


describe("cache.save", function() {

  it("saves cache to directory");

});


describe("cache.get", function() {

  it("retrieves item from its file if not loaded yet");

  it("retrieves item from memory if already loaded");

  it("returns data as a Buffer/String");

});


describe("cache.set", function() {

  it("sets item into memory for later retrieval");

  it("allows item as Buffer");

  it("allows items as String");

});
