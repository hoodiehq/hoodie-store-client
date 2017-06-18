var merge = require('lodash/merge')
var test = require('tape')

var PouchDB = require('../utils/pouchdb.js')
var Store = require('../../')

test('new Store(db, options)', function (t) {
  var store = new Store('test-db', merge({
    PouchDB: PouchDB,
    remote: 'test-db-remote'
  }))

  t.ok(store.db, 'sets .db on instance')
  t.is(store.db.name, 'test-db', '.db is PouchDB object')

  t.end()
})

test('Store(db, options) w/o new', function (t) {
  var store = Store('test-db', {
    PouchDB: PouchDB,
    remote: 'test-db-remote'
  })

  t.ok(store.db, 'sets .db on instance')
  t.is(store.db.name, 'test-db', '.db is PouchDB object')

  t.end()
})

test('new Store()', function (t) {
  t.throws(Store, 'throws error')

  t.end()
})

test('new Store(dbName)', function (t) {
  t.throws(Store.bind(null, 'db'), 'throws error')

  t.end()
})

test('new Store(db, options) with options.remote being a PouchDB instance', function (t) {
  var store = new Store('test-db', merge({
    PouchDB: PouchDB,
    remote: new PouchDB('test-db2')
  }))

  t.ok(store.db, 'sets .db on instance')
  t.is(store.db.name, 'test-db', '.db is PouchDB object')

  t.end()
})

test('new Store(db, options) with options.remote being a function that returns a PouchDB instance', function (t) {
  var store = new Store('test-db', merge({
    PouchDB: PouchDB,
    remote: function () {
      return new PouchDB('test-db2')
    }
  }))

  t.ok(store.db, 'sets .db on instance')
  t.is(store.db.name, 'test-db', '.db is PouchDB object')

  t.end()
})

test('new Store(db, options) with options.remote being a function that resolves with PouchDB instance', function (t) {
  var store = new Store('test-db', merge({
    PouchDB: PouchDB,
    remote: function () {
      return Promise.resolve(new PouchDB('test-db2'))
    }
  }))

  t.ok(store.db, 'sets .db on instance')
  t.is(store.db.name, 'test-db', '.db is PouchDB object')

  t.end()
})
