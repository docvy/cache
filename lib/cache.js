/**
* The Docvy Cache
*
* The MIT License (MIT)
* Copyright (c) 2015 GochoMugo <mugo@forfuture.co.ke>
*/


"use strict";


// npm-installed modules
// var uuid = require("node-uuid");
var utils = require("docvy-utils");


// module variables
var Cache;


// configuring our utils
utils.configure(__dirname + "/config.json");


// Defining the Cache
Cache = (function() {
  function Cache(configObject) {
    this._options = { };
    this.configure(configObject);
    return this;
  }

  Cache.prototype.configure = function(configObject) {
    configObject = configObject || { };
    this._options.maxAge = utils.getOptions("maxAge",
      configObject.maxAge);
    this._options.cacheDir = configObject.cacheDir ||
      utils.getPath("app.cache");
    return this;
  };

  Cache.prototype.getConfigurations = function() {
    return this._options;
  };

  return Cache;
})(); // IIFE


// Exporting from module
exports = module.exports = Cache;
exports.Cache = Cache;
