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
sync data. It combines [pouchdb-hoodie-api](https://github.com/hoodiehq/pouchdb-hoodie-api)
and [pouchdb-hoodie-sync](https://github.com/hoodiehq/pouchdb-hoodie-sync)

## API

```js
store = new Store(dbName, options)
// example:
// store = new Store('mydbname', { remote: 'http://localhost:5984/mydbname' })
// or:
// Store.defaults({remoteBaseUrl: 'http://localhost:5984' })
// store = new Store('mydb')

// all methods return promises
api.add(object)
api.add([object1, id2])
api.find(id)
api.find(object) // with id property
api.findOrAdd(id, object)
api.findOrAdd(object)
api.findOrAdd([object1, id2])
api.findAll()
api.findAll(filterFunction)
api.update(id, changedProperties)
api.update(id, updateFunction)
api.update(object)
api.update([object1, id2])
api.updateOrAdd(id, object)
api.updateOrAdd(object)
api.updateOrAdd([object1, id2])
api.updateAll(changedProperties)
api.updateAll(updateFunction)
api.remove(id)
api.remove(object)
api.remove([object1, id2])
api.removeAll()
api.removeAll(filterFunction)
api.clear() // removes all data without triggering events

// sync methods, return native promises
hoodie.store.pull() // pulls changes one-time
hoodie.store.push() // pushes changes one-time
hoodie.store.sync() // pulls and pushes changes one-time
hoodie.store.connect() // starts continuous replication
hoodie.store.disconnect() // stops continuous replication and all pending requests
// pull / push / sync can be filtered by id, object, array
hoodie.store.pull('objectId')
hoodie.store.push(object)
hoodie.store.push(['object1Id', object2])

// returns true or false if there are objects with unsynced changes
hoodie.store.hasLocalChanges()
// returns true or false if passed object (or id) has unsynced changes
hoodie.store.hasLocalChanges(id)
hoodie.store.hasLocalChanges(object)

// events
hoodie.store.on('add', function(object, options) {})
hoodie.store.on('update', function(object, options) {})
hoodie.store.on('remove', function(object, options) {})
hoodie.store.on('change', function(eventName, object, options) {})
hoodie.store.on('sync', function(object) {})
hoodie.store.on('clear', function() {})
hoodie.store.one(event, handler)
hoodie.store.off(event, handler)
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
var PouchDB = require('pouchdb')
PouchDB.plugin(require('pouchdb-hoodie-store'))
```

#### In the browser

Include this plugin after `pouchdb.js` in your HTML page:

```html
<script src="node_modules/pouchdb/dist/pouchdb.js"></script>
<script src="node_modules/pouchdb-hoodie-store/dist/pouchdb-hoodie-store.js"></script>
```

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
