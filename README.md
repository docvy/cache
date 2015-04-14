
# docvy-cache

[![Build Status](https://travis-ci.org/GochoMugo/docvy-cache.svg?branch=develop)](https://travis-ci.org/GochoMugo/docvy-cache) [![Coverage Status](https://coveralls.io/repos/GochoMugo/docvy-cache/badge.svg?branch=develop)](https://coveralls.io/r/GochoMugo/docvy-cache?branch=develop)

> The Docvy Cache


## programmatic usage:

```js
// the module returns a Cache constructor
var Cache = require("docvy-cache");

// also this returns a Cache constructor
var CacheConstructor = Cache.Cache;

// create a new cache
var cache = new Cache({
  maxAge: 1209600000, // in milliseconds
  cacheDir: __dirname + "/cache",
  waitForRestore: true
});

// restore cache
cache.restore(function(err) {
  if (err) { return console.log("cache could NOT be restored"); }
  return console.log("cache restored");
});

// setting an item
cache.set("appName", "docvy-app", function(err) {
  if (err) { return console.log("could not SET"); }
  return console.log("SET");
});

// getting the item
cache.get("appName", function(err, val) {
  if (err) { return console.log("could not GET"); }
  return console.log("GOT: " + val);
});

// removing the item
cache.unset("appName", function(err) {
  if (err) { return console.log("could not UNSET"); }
  return console.log("UNSET");
});


// saving cache
cache.save(function(err) {
  if (err) { return console.log("could not SAVE"); }
  return console.log("SAVED");
});


// we no longer need the cache?
cache.destroy(function(err) {
  if (err) { return console.log("could not DESTROY"); }
  return console.log("DESTROYED");
});
```


## API

### Cache([options])

This is the constructor for a Cache.

* `options` (Object):
  * `cacheDir` (String): path to a directory where cache items can be saved to
  * `maxAge` (Number): maximum amount of time to keep an item
  * `waitForRestore` (Boolean): whether to wait for cache to be restored before executing any queries.


### cache.restore([callback])

Restores the cache from a directory.

* `callback` (Function)

In case you had already saved a cache, you can restore it. Other than a possible error is passed to the callback.


### cache.save([callback])

Saves the cache to a directory.

* `callback` (Function)

Other than a possible error is passed to the callback.


### cache.set(key, value [, done])

Sets an Item

* `key` (String): key of the item
* `value` (String): value of the item
* `done` (Function): function called once query is complete. Other than a possible error is passed to the callback.


### cache.get(key, callback)

Returns value of item.

* `key` (String): key of the item
* `callback` (Function): function passed the value of item.
  * signature: `callback(err, value)`


### cache.unset(key [, done])

Removes an item from cache.

* `key` (String): key of the item
* `done` (Function): function called once query is complete. Other than a possible error is passed.


### cache.refresh([done])

Refreshes cache by removing expired items. All keys are checked to ensure they have not lived past their expiry time.

* `done` (Function): called once cache refreshing is complete. Other than a possible error is passed.


### cache.destroy([done])

Destroys the entire cache both from in-memory and file-system.

* `done` (Function): function called once destroying cache is complete. Other than a possible error is passed.


## installation:

Using [npm][npm] from [github][repo] (**bleeding edge**):

```bash
⇒ npm install GochoMugo/docvy-cache#develop
```


## todo:

* [ ] test for memory leaks
* [ ] get estimate size of cache
* [ ] allow setting ttl (time to live) for items
* [ ] clearing of *expired* items
  * [X] manual
  * [ ] automated
* [X] allow clearing/emptying of cache  `cache.destroy`


## license:

__The MIT License (MIT)__

Copyright (c) 2015 GochoMugo <mugo@forfuture.co.ke>


[npm]:https://npmjs.com
[repo]:https://github.com/GochoMugo/docvy-cache
