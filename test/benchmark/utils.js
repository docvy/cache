/**
* Utilities to keep it DRY
*
* The MIT License (MIT)
* Copyright (c) 2015 GochoMugo <mugo@forfuture.co.ke>
*/


"use strict";


// npm-installed modules
var nodeCache = require("memory-cache");


// own modules
var DocvyCache = require("../..");


// Exporting Instances
exports.nodeCache = nodeCache;
exports.docvyCache = new DocvyCache();

// Exporting Variables
exports.key = "key";
exports.value = "value";

