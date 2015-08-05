# NOTE: THIS IS WORK IN PROGRESS

Want to give a hand? We're happy to get you going. Ping us [@HoodieHQ](https://twitter.com/hoodiehq)
or in the [Hoodie Community Chat](http://hood.ie/chat/).

---

# pouchdb-hoodie-store

> Hoodie-like Store & Sync API on top of PouchDB

[![Build Status](https://travis-ci.org/hoodiehq/pouchdb-hoodie-store.svg?branch=master)](https://travis-ci.org/hoodiehq/pouchdb-hoodie-store)
[![Coverage Status](https://coveralls.io/repos/hoodiehq/pouchdb-hoodie-store/badge.svg?branch=master)](https://coveralls.io/r/hoodiehq/pouchdb-hoodie-store?branch=master)
[![Dependency Status](https://david-dm.org/hoodiehq/pouchdb-hoodie-store.svg)](https://david-dm.org/hoodiehq/pouchdb-hoodie-store)
[![devDependency Status](https://david-dm.org/hoodiehq/pouchdb-hoodie-store/dev-status.svg)](https://david-dm.org/hoodiehq/pouchdb-hoodie-store#info=devDependencies)

[![NPM](https://nodei.co/npm/pouchdb-hoodie-store.png?downloads=true&downloadRank=true&stars=true)](https://nodei.co/npm/pouchdb-hoodie-store/)

This plugin provides simple methods store and
sync data. It combines [pouchdb-hoodie-api](https://github.com/hoodiehq/pouchdb-hoodie-api), [pouchdb-hoodie-sync](https://github.com/hoodiehq/pouchdb-hoodie-sync), and [pouchdb-hoodie-local-changes](https://github.com/zoepage/pouchdb-hoodie-local-changes).

## API

```js
store = new Store(dbName, options)
// example:
// store = new Store('mydbname', { remote: 'http://localhost:5984/mydbname' })
// or:
// Store.defaults({remoteBaseUrl: 'http://localhost:5984' })
// store = new Store('mydb')

// all methods return promises
store.add(object)
store.add([object1, id2])
store.find(id)
store.find(object) // with id property
store.findOrAdd(id, object)
store.findOrAdd(object)
store.findOrAdd([object1, id2])
store.findAll()
store.findAll(filterFunction)
store.update(id, changedProperties)
store.update(id, updateFunction)
store.update(object)
store.update([object1, id2])
store.updateOrAdd(id, object)
store.updateOrAdd(object)
store.updateOrAdd([object1, id2])
store.updateAll(changedProperties)
store.updateAll(updateFunction)
store.remove(id)
store.remove(object)
store.remove([object1, id2])
store.removeAll()
store.removeAll(filterFunction)
store.clear() // removes all data without triggering events

// sync methods, return native promises
store.pull() // pulls changes one-time
store.push() // pushes changes one-time
store.sync() // pulls and pushes changes one-time
store.connect() // starts continuous replication
store.disconnect() // stops continuous replication and all pending requests
store.isConnected()
// pull / push / sync can be filtered by id, object, array
store.pull('objectId')
store.push(object)
store.push(['object1Id', object2])

store.hasLocalChanges()
store.hasLocalChanges(id)
store.hasLocalChanges(object)
store.hasLocalChanges([object1, id2])

// events
store.on('add', function(object, options) {})
store.on('update', function(object, options) {})
store.on('remove', function(object, options) {})
store.on('change', function(eventName, object, options) {})
store.on('pull', function(object) {})
store.on('push', function(object) {})
store.on('connect', function(object) {})
store.on('disconnect', function(object) {})
store.one(event, handler)
store.off(event, handler)
```

## Installation

Install via npm

```
npm install --save pouchdb
npm install --save pouchdb-hoodie-store
```

### Including the plugin

#### With browserify or on node.js/io.js

Attach this plugin to the `PouchDB` object:

```js
var Store = require('pouchdb-hoodie-store')
```

#### In the browser

Include this plugin in your HTML page:

```html
<script src="node_modules/pouchdb-hoodie-store/dist/pouchdb-hoodie-store.js"></script>
```

Since `pouchdb.js` is bundled into the plugin by default, there's no need to load it separately.
If you want to load your own PouchDB, just add it before loading the plugin, and it'll use your version of `pouchdb.js`.  
  
```html
<script src="node_modules/pouchdb/dist/pouchdb.js"></script>
```

Additionally we will distribute a "without PouchDB" version `pouchdb-hoodie-store-without-pouchdb.js` which you  
should use if you specify your own pouchdb version.

## Testing

[![Sauce Test Status](https://saucelabs.com/browser-matrix/hoodie-pouch.svg)](https://saucelabs.com/u/hoodie-pouch)

_Test are currently not running on >IE10 and mobile Safari. This is likely an error with the setup and we would be more than happy if you'd want to fix that :)_

### In Node.js

Run all tests and validates JavaScript Code Style using [standard](https://www.npmjs.com/package/standard)

```
npm test
```

To run only the tests

```
npm run test:node
```

### In the browser

```
test:browser:local
```

This will start a local server. All tests and coverage will be run at [http://localhost:8080/__zuul](http://localhost:8080/__zuul)

## Contributing

Have a look at the Hoodie project's [contribution guidelines](https://github.com/hoodiehq/hoodie-dotfiles/blob/master/static/CONTRIBUTING.md).
If you want to hang out you can join #hoodie-pouch on our [Hoodie Community Slack](http://hood.ie/chat/).
