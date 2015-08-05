
# docvy-cache

> An in-memory cache capable of being swapped from and to disk. For Node.js applications.

[![node](https://img.shields.io/node/v/docvy-cache.svg?style=flat-square)](https://www.npmjs.com/package/docvy-cache) [![npm](https://img.shields.io/npm/v/docvy-cache.svg?style=flat-square)](https://www.npmjs.com/package/docvy-cache) [![Travis](https://img.shields.io/travis/docvy/cache.svg?style=flat-square)](https://travis-ci.org/docvy/cache) [![Gemnasium](https://img.shields.io/gemnasium/docvy/cache.svg?style=flat-square)](https://gemnasium.com/docvy/cache) [![Coveralls](https://img.shields.io/coveralls/docvy/cache.svg?style=flat-square)](https://coveralls.io/github/docvy/cache?branch=master)


## table of contents:

1. [example usage](#example)
1. [cache API](#api)
1. [installation](#installation)
1. [todo](#todo)
1. [license](#license)


<a name="example"></a>
## example usage:

```js
// the module returns a Cache constructor
var Cache = require("docvy-cache");

// also this returns a Cache constructor
var CacheConstructor = Cache.Cache;

// create a new cache
var cache = new Cache({
  maxAge: 1209600000, // in milliseconds
  cacheDir: __dirname + "/cache", // where to swap from/to disk
  waitForRestore: true // wait for restoration to complete before any query
});

/**
* All these operations are asynchronous. You might need to structure
* your calls to the cache better
*/

// restore cache
cache.restore(function(err) {
  if (err) { return console.log("could not RESTORE"); }
  return console.log("RESTORED");
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

// refreshing cache incase we had old items
cache.refresh(function(err) {
  if (err) { return console.log("could not REFRESH"); }
  return console.log("REFRESHED");
});

// we no longer need the cache?
cache.destroy(function(err) {
  if (err) { return console.log("could not DESTROY"); }
  return console.log("DESTROYED");
});
```


<a name="api"></a>
## API

### Cache([options])

This is the constructor for a Cache.

* `options` (Object):
  * `cacheDir` (String): path to a directory where cache items can be saved to
  * `maxAge` (Number): maximum amount of time to keep an item, in milliseconds
  * `waitForRestore` (Boolean): whether to wait for cache to be restored before executing any queries.


### cache.restore([done])

Restores the cache from its directory, as specified in `cacheDir` during instantiation.

* `done` (Function): other than a possible error is passed to the callback.

In case you had already saved a cache, you can restore it.


### cache.save([done])

Saves the cache to its directory.

* `done` (Function): other than a possible error is passed to the callback.


### cache.set(key, value [, options] [, done])

Sets an Item

* `key` (String): key of the item
* `value` (String): value of the item
* `options` (Object):
  * `maxAge`: a custom `maxAge` for this item. **NOTE:** this value is ignored for items already set into cache. It is only respected if its a new item being set.
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


<a name="installation"></a>
## installation:

(**Bleeding Edge**) Installing from [github][repo] using [npm][npm]:

```bash
⇒ npm install docvy-cache
```


<a name="todo"></a>
## todo:

* [ ] test for memory leaks
* [ ] get estimate size of cache
* [X] allow setting ttl (time to live) for items
* [ ] clearing of *expired* items
  * [X] manual  `cache.refresh`
  * [ ] automated
* [X] allow clearing/emptying of cache  `cache.destroy`
* [ ] use promises
* [ ] analyse performance against other in-memory Node.js caches


<a name="license"></a>
## license:

__The MIT License (MIT)__

Copyright (c) 2015 Forfuture <we@forfuture.co.ke> <br/>
Copyright (c) 2015 GochoMugo <mugo@forfuture.co.ke>


[npm]:https://npmjs.com
[repo]:https://github.com/docvy/cache
