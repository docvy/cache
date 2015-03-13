/**
* Error definitions
*
* The MIT License (MIT)
* Copyright (c) 2015 GochoMugo <mugo@forfuture.co.ke>
*/


"use strict";


// npm-installed modules
var utils = require("docvy-utils");


exports = module.exports = {
  InvalidKeyError: utils.defineError("ECACHEIKEY", "Invalid Key"),
  InvalidValueError: utils.defineError("ECACHEIVAL", "Invalid Value"),
  ReadItemDataError: utils.defineError("ECACHERITEM", "Reading " +
    "item's data failed'"),
  RestoreError: utils.defineError("ECACHEREST", "Cache restoration " +
    "failed"),
  SaveError: utils.defineError("ECACHESAVE", "Cache saving failed"),
  UnsetError: utils.defineError("ECACHEUNSET", "Item unset failed")
};
