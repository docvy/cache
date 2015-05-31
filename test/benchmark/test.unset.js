/**
* Benchmarking `unset` method
*
* The MIT License (MIT)
* Copyright (c) 2015 GochoMugo <mugo@forfuture.co.ke>
*/


"use strict";


var utils = require("./utils");


module.exports = {
  name: "Unsetting elements from cache",
  tests: {
    "docvyCache#unset": {
      defer: true,
      onCycle: function() {
        utils.docvyCache.set(utils.key, utils.value);
      },
      fn: function(deferred) {
        utils.docvyCache.unset(utils.key,
          deferred.resolve.bind(deferred));
      }
    },
    "nodeCache#del": {
      onCycle: function() {
        utils.nodeCache.put(utils.key, utils.value);
      },
      fn: function() {
        utils.nodeCache.del(utils.key);
      }
    }
  }
};

