# hoodie-store-client

> Hoodie-like Store & Sync API on top of PouchDB

[![Build Status](https://travis-ci.org/hoodiehq/hoodie-store-client.svg?branch=master)](https://travis-ci.org/hoodiehq/hoodie-store-client)
[![Coverage Status](https://coveralls.io/repos/hoodiehq/hoodie-store-client/badge.svg?branch=master)](https://coveralls.io/r/hoodiehq/hoodie-store-client?branch=master)
[![Dependency Status](https://david-dm.org/hoodiehq/hoodie-store-client.svg)](https://david-dm.org/hoodiehq/hoodie-store-client)
[![devDependency Status](https://david-dm.org/hoodiehq/hoodie-store-client/dev-status.svg)](https://david-dm.org/hoodiehq/hoodie-store-client#info=devDependencies)

[![NPM](https://nodei.co/npm/@hoodie/store-client.png?downloads=true&downloadRank=true&stars=true)](https://nodei.co/npm/@hoodie/store-client/)

This plugin provides simple methods store and
sync data. It combines [pouchdb-hoodie-api](https://github.com/hoodiehq/pouchdb-hoodie-api) and [pouchdb-hoodie-sync](https://github.com/hoodiehq/pouchdb-hoodie-sync).

## Example

```js
var Store = require('@hoodie/store-client')
var store = new Store('mydbname', { remote: 'http://localhost:5984/mydbname' })
// or
Store.defaults({remoteBaseUrl: 'http://localhost:5984' })
var store = new Store('mydb')
```

## API

```js
store = new Store(dbName, options)
// options.ajax: options or function that returns options to be passed to all replications

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
// removes all data only triggering the 'clear' event
// options are passed to new PouchDB instance
store.reset(options)

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
npm install --save @hoodie/store-client
```

### Including the plugin

#### With browserify or on node.js/io.js

Attach this plugin to the `PouchDB` object:

```js
var Store = require('@hoodie/store-client')
```

#### In the browser

Include this plugin in your HTML page:

```html
<script src="node_modules/@hoodie/store-client/dist/hoodie-store-client.js"></script>
```

Since `pouchdb.js` is bundled into the plugin by default, there's no need to load it separately.
If you want to load your own PouchDB, just add it before loading the plugin, and it'll use your version of `pouchdb.js`.  

```html
<script src="node_modules/pouchdb/dist/pouchdb.js"></script>
```

Additionally we will distribute a "without PouchDB" version `hoodie-client-store-without-pouchdb.js` which you  
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
npm run test:browser:local
```

This will start a local server. All tests and coverage will be run at [http://localhost:8080/__zuul](http://localhost:8080/__zuul)

## Contributing

Have a look at the Hoodie project's [contribution guidelines](https://github.com/hoodiehq/hoodie-dotfiles/blob/master/static/CONTRIBUTING.md).
If you want to hang out you can join #hoodie-pouch on our [Hoodie Community Slack](http://hood.ie/chat/).

## License

[Apache 2.0](http://www.apache.org/licenses/LICENSE-2.0)
