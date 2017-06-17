var test = require('tape')
var simple = require('simple-mock')

var PouchDB = require('../utils/pouchdb.js')
var Store = require('../../')

test('.isPersistent()', function (t) {
  var store = new Store('test-db-is-persistent', {
    PouchDB: PouchDB,
    remote: 'test-db-is-persistent-remote'
  })
  t.is(typeof store.isPersistent, 'function', 'exists')

  simple.mock(store.db, 'adapter', 'memory')
  t.is(store.isPersistent(), false, 'returns true if PouchDB adapter is memory')

  simple.mock(store.db, 'adapter', 'idb')
  t.is(store.isPersistent(), true, 'returns true if PouchDB adapter is idb')

  simple.restore()
  t.end()
})
