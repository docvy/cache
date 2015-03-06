/**
* Run (unit) tests against the Docvy Cache
*
* The MIT License (MIT)
* Copyright (c) 2015 GochoMugo <mugo@forfuture.co.ke>
*/


// npm-installed modules
var should = require("should");


// own modules
var cache = require("../lib/cache");


describe("module", function() {

  it("lets instantiating new cache from module object");

});

describe("cache.Cache", function() {

  it("is a class used to instantiate new caches");

});


describe("cache.configure", function() {

  it("maxAge option sets maximum life of item");

  it("cacheDir option sets cache directory");

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
