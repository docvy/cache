/**
 * Docvy Cache Item
 *
 * The MIT License (MIT)
 * Copyright (c) 2015 GochoMugo <mugo@forfuture.co.ke>
 */


"use strict";


// npm-installed modules
var uuid = require("node-uuid");


function Item(value, maxAge) {
  this.uuid = uuid.v4();
  this.data = value;
  this.expiryTime = Date.now() + maxAge;
  return this;
}


exports = module.exports = Item;
exports.Item = Item;
