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
var _ = require("lodash");
var rimraf = require("rimraf");
var utils = require("docvy-utils");


// own modules
var Item = require("./item");
var config = require("./config");
var errors = require("./errors");


function Cache(configObject) {
  this._options = { };
  this._items = { };
  this._queue = [ ];
  this._ready = false;
  this.configure(configObject);
  return this;
}


Cache.prototype._emptyQueue = function _emptyQueue() {
  var requests = this._queue;
  this._queue = [ ];
  for (var index in requests) {
    requests[index]();
  }
  return this;
};


Cache.prototype._callWhenReady = function _callWhenReady(fn) {
  var me = this;
  var _fn = function() { fn.call(me); };
  if ((!this._ready) && this._options.waitForRestore) {
    return this._queue.push(_fn);
  }
  return _fn();
};


Cache.prototype.configure = function configure(configObject) {
  configObject = configObject || { };
  _.merge(this._options, config, configObject);
  this._options.cacheDir = configObject.cacheDir || utils.getPath("app.cache");
  return this;
};


Cache.prototype.getConfigurations = function getConfigurations() {
  return this._options;
};


Cache.prototype._pathToKeysFile = function _pathToKeysFile() {
  return path.join(this._options.cacheDir, this._options.keyFileName);
};


Cache.prototype.restore = function restore(done) {
  done = utils.defineCallback(done);
  var me = this;
  return fs.readFile(me._pathToKeysFile(), {
    encoding: "utf8",
  }, function(fileReadError, data) {
    if (fileReadError && fileReadError.code !== "ENOENT") {
      return done(new errors.RestoreError(fileReadError));
    }
    if (data) {
      try {
        me._items = JSON.parse(data);
      } catch (jsonParseError) {
        return done(new errors.RestoreError(jsonParseError));
      }
    }
    done(null); // we call `done` before any functions in queue
    me._ready = true;
    me._emptyQueue();
  });
};


Cache.prototype.save = function(done) {
  done = utils.defineCallback(done);
  var itemNamesArray = _.keys(this._items);
  var index = 0;
  var itemNum = itemNamesArray.length;
  var errs = [ ];
  var me = this;
  fs.mkdir(me._options.cacheDir, function() {
    saveFiles();
  });

  function saveFiles() {
    var itemName = itemNamesArray[index];
    var item = me._items[itemName];
    var filename = item.uuid;
    var filepath = path.join(me._options.cacheDir, filename);
    var filedata = item.data;
    if (!filedata) {
      return saveFiles();
    }
    fs.writeFile(filepath, filedata, function(fileWriteError) {
      if (fileWriteError) {
        errs.push(fileWriteError);
      }
      if (++index !== itemNum) {
        return saveFiles();
      }
      return saveKeyFile();
    });
  }

  function saveKeyFile() {
    var keyData = { };
    // strip out data
    for (var name in me._items) {
      keyData[name] = _.cloneDeep(me._items[name]);
      if (keyData[name].data) {
        delete keyData[name].data;
      }
    }
    keyData = JSON.stringify(keyData);
    fs.writeFile(me._pathToKeysFile(), keyData, function(fileWriteError) {
      if (fileWriteError) {
        errs.push(fileWriteError);
      }
      var ret = errs.length === 0 ? null : new errors.SaveError(new Error(errs));
      return done(ret);
    });
  }
};


Cache.prototype.set = function set(key, value, options, done) {
  if (!done) {
    done = utils.defineCallback(options);
    options = { };
  }
  var me = this;
  me._callWhenReady(function() {
    if (!_.isString(key)) {
      return done(new errors.InvalidKeyError());
    }
    if (!_.isString(value)) {
      return done(new errors.InvalidValueError());
    }
    var item = me._items[key];
    if (item) {
      item.data = value;
    } else {
      item = new Item(value, options.maxAge || me._options.maxAge);
      me._items[key] = item;
    }
    return done(null);
  });
};


Cache.prototype.unset = function unset(key, done) {
  done = utils.defineCallback(done);
  var me = this;
  me._callWhenReady(function() {
    if (!me.has(key)) {
      return done(null);
    }
    var item = me._items[key];
    var filepath = path.join(me._options.cacheDir, item.uuid);
    fs.unlink(filepath, function(unlinkErr) {
      if (unlinkErr && unlinkErr.code !== "ENOENT") {
        return done(new errors.UnsetError(unlinkErr));
      }
      delete me._items[key];
      return done(null);
    }); // fs.unlink
  }); // this._callWhenReady
};


Cache.prototype.has = function has(key) {
  return !!this._items[key];
};


Cache.prototype.get = function get(key, callback) {
  callback = utils.defineCallback(callback);
  var me = this;
  return me._callWhenReady(function() {
    if (!_.isString(key)) {
      return callback(new errors.InvalidKeyError());
    }
    if (!me.has(key)) {
      return callback(null, null);
    }
    var item = me._items[key];
    if (item.data) {
      return callback(null, item.data);
    }
    var filepath = path.join(me._options.cacheDir, item.uuid);
    fs.readFile(filepath, { encoding: "utf8" }, function(readFileErr, data) {
      if (readFileErr) {
        return callback(new errors.ReadItemDataError(readFileErr));
      }
      item.data = data; // put in memory
      return callback(null, data);
    });
  });
};


Cache.prototype.destroy = function destroy(done) {
  done = utils.defineCallback(done);
  var me = this;
  return me._callWhenReady(function() {
    me._items = { }; // remove from memory
    // remove from file-system
    rimraf(me._options.cacheDir, function(rimrafErr) {
      if (rimrafErr) {
        return done(new errors.DestroyError(rimrafErr));
      }
      return done(); // done
    }); // fs.rmdir
  }); // this._callWhenReady
};


Cache.prototype.refresh = function refresh(done) {
  done = utils.defineCallback(done);
  var me = this;
  me._callWhenReady(function() {
    var currentTime = Date.now();
    var keys = _.keys(me._items);
    var index = -1; // we start at -1 so that the next index be Zero
    var errs = [ ];
    check();

    function check() {
      index++;
      var key = me._items[keys[index]];
      // we must have passed through all the keys
      if (index >= keys.length) {
        if (errs.length) {
          return done(new errors.RefreshError());
        }
        return done();
      }
      if (key.expiryTime < currentTime) {
        // this `return` ensures we stop here
        return me.unset(keys[index], function(err) {
          if (err) {
            return errs.push(err);
          }
          return check();
        });
      }
      return check(); // next item please, that one was valid
    }
  });
};


// Exporting from module
exports = module.exports = Cache;
exports.Cache = Cache;
