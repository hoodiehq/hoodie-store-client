var merge = require('lodash/merge')
var test = require('tape')

var dbFactory = require('../utils/db')
var Store = require('../../')

var options = process.browser ? {
  adapter: 'memory'
} : {
  db: require('memdown')
}

test('new Store(db, options)', function (t) {
  var store = new Store('test-db', merge({remote: 'test-db-remote'}, options))
  var testDB = dbFactory('test-db')

  t.is(typeof store, 'function', 'is a constructor')
  t.ok(store.db, 'sets .db on instance')
  t.is(store.db.name, testDB.name, '.db is PouchDB object')

  t.end()
})

test('Store(db, options) w/o new', function (t) {
  var store = Store('test-db', merge({remote: 'test-db-remote'}, options))
  var testDB = dbFactory('test-db')

  t.is(typeof store, 'function', 'is a constructor')
  t.ok(store.db, 'sets .db on instance')
  t.is(store.db.name, testDB.name, '.db is PouchDB object')

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

test('new Store("name", {remote: "othername"})', function (t) {
  var store = new Store('name', merge({ remote: 'othername' }, options))
  t.is(store.db.__opts.remote, 'othername', 'sets remote name to "othername"')

  t.end()
})

test('new Store("name", {remoteBaseUrl: "https://example.com"})', function (t) {
  var store = new Store('name', merge({ remoteBaseUrl: 'https://my.cou.ch' }, options))
  t.is(store.db.__opts.remote, 'https://my.cou.ch/name', 'sets remote name to "https://my.cou.ch/name"')

  t.end()
})

test('remoteBaseUrl with trailing /', function (t) {
  var store = new Store('name', merge({ remoteBaseUrl: 'https://my.cou.ch/' }, options))
  t.is(store.db.__opts.remote, 'https://my.cou.ch/name', 'sets remote name without double //')

  t.end()
})

test('new Store("name", {remote: "othername", remoteBaseUrl: "https://example.com"})', function (t) {
  var store = new Store('name', merge({ remote: 'othername', remoteBaseUrl: 'https://my.cou.ch' }, options))
  t.is(store.db.__opts.remote, 'https://my.cou.ch/othername', 'sets remote name to "https://my.cou.ch/othername"')

  t.end()
})

test('new Store("name", {remote: "othername", remoteBaseUrl: "https://example.com"})', function (t) {
  var store = new Store('name', merge({ remote: 'https://my.other.cou.ch/name', remoteBaseUrl: 'https://my.cou.ch' }, options))
  t.is(store.db.__opts.remote, 'https://my.other.cou.ch/name', 'sets remote name to "https://my.cou.ch/othername"')

  t.end()
})

test('Store.defaults({remote})', function (t) {
  var CustomStore = Store.defaults(merge({remote: 'test-db-custom-remote'}, options))
  var store = new CustomStore('test-db-custom')

  t.throws(CustomStore, 'throws without argumens')
  t.is(store.db.__opts.remote, 'test-db-custom-remote', 'sets remote name')

  t.end()
})

test('Store.defaults({remoteBaseUrl})', function (t) {
  var CustomStore = Store.defaults(merge({remoteBaseUrl: 'http://example.com'}, options))
  var store = new CustomStore('test-db-custom')
  var store2 = new CustomStore('test-db-custom2')

  t.is(store.db.__opts.remote, 'http://example.com/test-db-custom', 'sets remote name')
  t.is(store2.db.__opts.remote, 'http://example.com/test-db-custom2', 'sets remote name correcly on multiple instances')

  t.end()
})

test('Store api exports', function (t) {
  var store = new Store('test-db', merge({remote: 'test-db-remote'}, options))

  t.is(typeof store.clear, 'undefined', 'store doesnt expose clear method')

  t.end()
})
