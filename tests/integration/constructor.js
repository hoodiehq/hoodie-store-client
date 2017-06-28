var assign = require('lodash/assign')
var simple = require('simple-mock')
var test = require('tape')

var PouchDB = require('../utils/pouchdb.js')
var Store = require('../../')

test('new Store(db, options)', function (t) {
  var store = new Store('test-db', assign({
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
  var store = new Store('test-db', assign({
    PouchDB: PouchDB,
    remote: new PouchDB('test-db2')
  }))

  t.ok(store.db, 'sets .db on instance')
  t.is(store.db.name, 'test-db', '.db is PouchDB object')

  t.end()
})

test('new Store(db, options) with options.remote being a function that returns a PouchDB instance', function (t) {
  var store = new Store('test-db', assign({
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
  var store = new Store('test-db', assign({
    PouchDB: PouchDB,
    remote: function () {
      return Promise.resolve(new PouchDB('test-db2'))
    }
  }))

  t.ok(store.db, 'sets .db on instance')
  t.is(store.db.name, 'test-db', '.db is PouchDB object')

  t.end()
})

test('new Store(db, options) with options.remote being a getter', function (t) {
  t.plan(2)
  var store = new Store('test-db', assign({
    PouchDB: PouchDB,
    get remote () {
      t.pass('calls options.remote getter')
      return new PouchDB('test-db2')
    }
  }))

  store.sync()
  store.sync()
})

test('new Store(db, options) with remoteBaseUrl and no remote', function (t) {
  var options = {
    PouchDB: PouchDB,
    remoteBaseUrl: 'http://localhost:5984'
  }
  Store('test-db', options)

  t.is(options.remote, 'http://localhost:5984/test-db', 'sets .remote on instance')

  t.end()
})

test('new Store(db, options) with remoteBaseUrl and https:// remote', function (t) {
  var options = {
    PouchDB: PouchDB,
    remote: 'https://hood.ie:5984',
    remoteBaseUrl: 'http://localhost:5984'
  }
  Store('test-db', options)

  t.is(options.remote, 'https://hood.ie:5984', '.remote unchanged when it is an https endpoint')

  t.end()
})

test('Store.defaults throws when database name is not a string', function (t) {
  var defaults = Store.defaults({})

  t.throws(
    function () { defaults(123, {}) },
      /Must be a valid string/,
    'when database name is not a string, throws an error'
  )

  t.end()
})

test('Store.defaults with defaults', function (t) {
  var pouchStub = simple.stub()
  var options = {
    PouchDB: pouchStub,
    remote: 'test-db-remote',
    foo: 'baz'
  }
  simple.mock(Store.internals, 'handleChanges').callFn(function () {})

  var defaults = Store.defaults(options)

  defaults('test-db')

  t.is(pouchStub.callCount, 1, 'use default value when no value is provided')

  simple.restore()

  t.end()
})

test('Store.defaults overriden', function (t) {
  var pouchDefaultStub = simple.stub()
  var pouchOverrideStub = simple.stub()
  var options = {
    PouchDB: pouchDefaultStub,
    remote: 'test-db-remote',
    foo: 'baz'
  }
  simple.mock(Store.internals, 'handleChanges').callFn(function () {})

  var defaults = Store.defaults(options)

  defaults('test-db', { PouchDB: pouchOverrideStub })

  t.is(pouchDefaultStub.callCount, 0, 'default value is overridden')
  t.is(pouchOverrideStub.callCount, 1, 'overridden value is used')

  simple.restore()

  t.end()
})
