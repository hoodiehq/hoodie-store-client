var test = require('tape')
var simple = require('simple-mock')

var PouchDB = require('../utils/pouchdb.js')
var Store = require('../../')
var uniqueName = require('../utils/unique-name')

test('.isPersistent()', function (t) {
  var name = uniqueName()
  var store = new Store(name, {
    PouchDB: PouchDB,
    remote: 'remote-' + name
  })
  t.is(typeof store.isPersistent, 'function', 'exists')

  simple.mock(store.db, 'adapter', 'memory')
  t.is(store.isPersistent(), false, 'returns true if PouchDB adapter is memory')

  simple.mock(store.db, 'adapter', 'idb')
  t.is(store.isPersistent(), true, 'returns true if PouchDB adapter is idb')

  simple.restore()
  t.end()
})
