'use strict'

var test = require('tape')

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
  t.is(store.db, testDB, '.db is PouchDB object')
})

test('constructs a store object w/o new', function (t) {
  t.plan(3)

  var store = Store('test-db', options)
  var testDB = dbFactory('test-db')

  t.is(typeof store, 'object', 'is object')
  t.ok(store.db, '.db exists')
  t.is(store.db, testDB, '.db is PouchDB object')
})

test('throws an error w/o db', function (t) {
  t.plan(2)

  t.throws(Store, 'no arguments')
  t.notOk(Store.db, 'db does not exist')
})
