/**
* The Docvy Cache
*
* The MIT License (MIT)
* Copyright (c) 2015 GochoMugo <mugo@forfuture.co.ke>
*/


"use strict";


// built-in modules
var fs = require("fs");
var path = require("path");


// npm-installed modules
var lodash = require("lodash");
var uuid = require("node-uuid");
var utils = require("docvy-utils");


// module variables
var Cache, Item;


// configuring our utils
utils.configure(__dirname + "/config.json");


// Defining a Cache Item
Item = (function() {

  function Item(value) {
    this.uuid = uuid.v4();
    this.data = value;
  }

  return Item;
})();


// Defining the Cache
Cache = (function() {
  function Cache(configObject) {
    this._options = { };
    this._items = { };
    this.configure(configObject);
    return this;
  }

  Cache.prototype.configure = function(configObject) {
    configObject = configObject || { };
    this._options.maxAge = utils.getOptions("maxAge",
      configObject.maxAge);
    this._options.cacheDir = configObject.cacheDir ||
      utils.getPath("app.cache");
    this._options.keyFileName = utils.getOptions("keyFileName");
    return this;
  };

  Cache.prototype.getConfigurations = function() {
    return this._options;
  };

  Cache.prototype._pathToKeysFile = function() {
    return path.join(this._options.cacheDir,
      this._options.keyFileName);
  };

  Cache.prototype.restore = function(done) {
    done = utils.defineCallback(done);
    var _this = this;
    fs.readFile(_this._pathToKeysFile(), { encoding: "utf8" },
    function(fileReadError, data) {
      if (fileReadError) { return done(fileReadError); }
      try {
        _this._items = JSON.parse(data);
      } catch (jsonParseError) {
        return done(jsonParseError);
      }
      return done(null);
    });
  };

  Cache.prototype.save = function(done) {
    done = utils.defineCallback(done);
    var itemNamesArray = lodash.keys(this._items);
    var index = 0;
    var itemNum = itemNamesArray.length;
    var errors = [];
    var _this = this;
    fs.mkdir(_this._options.cacheDir, function() {
      saveFiles();
    });

    function saveFiles() {
      var itemName = itemNamesArray[index];
      var item = _this._items[itemName];
      var filename = item.uuid;
      var filepath = path.join(_this._options.cacheDir, filename);
      var filedata = item.data;
      if (! filedata) { return saveFiles(); }
      fs.writeFile(filepath, filedata, function(fileWriteError) {
        if (fileWriteError) { errors.push(fileWriteError); }
        if (++index !== itemNum) { return saveFiles(); }
        // finishing up
        return saveKeyFile();
      });
    }

    function saveKeyFile() {
      var keyData = { };
      // strip out data
      for (var name in _this._items) {
        keyData[name] = lodash.cloneDeep(_this._items[name]);
        if (keyData[name].data) { delete keyData[name].data; }
      }
      keyData = JSON.stringify(keyData);
      fs.writeFile(_this._pathToKeysFile(), keyData,
      function(fileWriteError) {
        if (fileWriteError) { errors.push(fileWriteError); }
        return done(errors.length === 0 ? null : errors);
      });
    }
  };

  Cache.prototype.set = function(key, value) {
    if (lodash.isString(key) && lodash.isString(value)) {
      var item = this._items[key];
      if (item) {
        item.data = value;
      } else {
        item = new Item(value);
        this._items[key] = item;
      }
    }
  };

  Cache.prototype.get = function(key, callback) {
    callback = utils.defineCallback(callback);
    if (! lodash.isString(key)) { return callback(new Error()); }
    var item = this._items[key];
    if (! item) { return callback(new Error()); }
    if (item.data) { return callback(null, item.data); }
    var filepath = path.join(this._options.cacheDir, item.uuid);
    fs.readFile(filepath, { encoding: "utf8" }, function(err, data) {
      if (err) { return callback(err); }
      item.data = data; // put in memory
      return callback(null, data);
    });
  };

  return Cache;
})(); // IIFE


// Exporting from module
exports = module.exports = Cache;
exports.Cache = Cache;
