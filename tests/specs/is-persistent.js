var test = require('tape')
var simple = require('simple-mock')

var isPersistent = require('../../lib/is-persistent')
var internals = isPersistent.internals
var PouchDB = require('../utils/pouchdb.js')
var Store = require('../../')

test('.isPersistent()', function (t) {
  var store = new Store('test-db-is-persistent', {
    PouchDB: PouchDB,
    remote: 'test-db-is-persistent-remote'
  })
  t.is(typeof store.isPersistent, 'function', 'exists')

  simple.mock(internals, 'humbleLocalStorage', {isPersistent: true})
  t.is(store.isPersistent(), true, 'returns true if humbleLocalStorage.isPersistent is true')

  simple.mock(internals, 'humbleLocalStorage', {isPersistent: false})
  t.is(store.isPersistent(), false, 'returns false if humbleLocalStorage.isPersistent is false')

  simple.restore()
  t.end()
})
