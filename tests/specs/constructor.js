'use strict'

var test = require('tape')
var rimraf = require('rimraf')

var dbFactory = require('../utils/db')
var Store = require('../../')

var options = process.browser ? {
  adapter: 'memory'
} : {
  db: require('memdown')
}

test('constructs a store object with a db property', function (t) {
  t.plan(3)

  var store = new Store('test-db', options)
  var testDB = dbFactory('test-db')

  t.is(typeof store, 'object', 'is object')
  t.ok(store.db, '.db exists')
  t.is(store.db._db_name, testDB._db_name, '.db is PouchDB object')
})

test('constructs a store object w/o new', function (t) {
  t.plan(3)

  var store = Store('test-db', options)
  var testDB = dbFactory('test-db')

  t.is(typeof store, 'object', 'is object')
  t.ok(store.db, '.db exists')
  t.is(store.db._db_name, testDB._db_name, '.db is PouchDB object')
})

test('throws an error w/o db', function (t) {
  t.plan(2)

  t.throws(Store, 'no arguments')
  t.notOk(Store.db, 'db does not exist')
})

test('constructs a store object without options', function (t) {
  t.plan(3)

  var store = new Store('test-db-noptions')
  var testDB = dbFactory('test-db-noptions')

  t.is(typeof store, 'object', 'is object')
  t.ok(store.db, '.db exists')
  t.is(store.db._db_name, testDB._db_name, '.db is PouchDB object')

  // clean up the files created by this test
  if (!process.browser) {
    testDB.then(function () {
      rimraf('test-db-noptions/', function (err) { console.log(err) })
    })
  }
})

test('constructs a store object with remote option', function (t) {
  t.plan(2)

  var newOptions = options
  newOptions.remote = 'custom-remote-name'

  var store = new Store('test-db-remote-option', newOptions)

  t.is(typeof store, 'object', 'is object')
  t.is(store.db.__opts.remote, newOptions.remote, 'has correct remote name')
})
