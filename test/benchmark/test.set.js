/**
* Benchmarking `set` method
*
* The MIT License (MIT)
* Copyright (c) 2015 GochoMugo <mugo@forfuture.co.ke>
*/


"use strict";


var utils = require("./utils");


module.exports = {
  name: "Setting elements into cache",
  tests: {
    "docvyCache#set": {
      defer: true,
      fn: function(deferred) {
        utils.docvyCache.set(utils.key, utils.value,
          deferred.resolve.bind(deferred));
      },
    },
    "nodeCache#put": {
      fn: function() {
        utils.nodeCache.put(utils.key, utils.value);
      },
    },
  },
};
