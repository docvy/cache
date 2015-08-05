/**
 * Benchmarking `get` method
 *
 * The MIT License (MIT)
 * Copyright (c) 2015 GochoMugo <mugo@forfuture.co.ke>
 */


"use strict";


var utils = require("./utils");


utils.docvyCache.set(utils.key, utils.value);
utils.nodeCache.put(utils.key, utils.value);


module.exports = {
  name: "Getting elements from cache",
  tests: {
    "docvyCache#get": {
      defer: true,
      fn: function(deferred) {
        utils.docvyCache.get(utils.key,
          deferred.resolve.bind(deferred));
      },
    },
    "nodeCache#get": {
      fn: function() {
        utils.nodeCache.get(utils.key);
      },
    },
  },
};
