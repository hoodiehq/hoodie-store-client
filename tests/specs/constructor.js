var merge = require('lodash.merge')
var rimraf = require('rimraf')
var test = require('tape')

var dbFactory = require('../utils/db')
var Store = require('../../')

var options = process.browser ? {
  adapter: 'memory'
} : {
  db: require('memdown')
}

test('new Store(db, options)', function (t) {
  t.plan(3)

  var store = new Store('test-db', merge({remote: 'test-db-remote'}, options))
  var testDB = dbFactory('test-db')

  t.is(typeof store, 'object', 'is a constructor')
  t.ok(store.db, 'sets .db on instance')
  t.is(store.db._db_name, testDB._db_name, '.db is PouchDB object')
})

test('Store(db, options) w/o new', function (t) {
  t.plan(3)

  var store = Store('test-db', merge({remote: 'test-db-remote'}, options))
  var testDB = dbFactory('test-db')

  t.is(typeof store, 'object', 'is a constructor')
  t.ok(store.db, 'sets .db on instance')
  t.is(store.db._db_name, testDB._db_name, '.db is PouchDB object')
})

test('new Store()', function (t) {
  t.plan(1)

  t.throws(Store, 'throws error')
})

test('new Store(dbName)', function (t) {
  t.plan(1)

  t.throws(Store.bind(null, 'db'), 'throws error')
})

test('new Store("name", {remote: "othername"})', function (t) {
  t.plan(1)

  var store = new Store('name', merge({ remote: 'othername' }, options))
  t.is(store.db.__opts.remote, 'othername', 'sets remote name to "othername"')
})

test('new Store("name", {remoteBaseUrl: "https://example.com"})', function (t) {
  t.plan(1)

  var store = new Store('name', merge({ remoteBaseUrl: 'https://my.cou.ch' }, options))
  t.is(store.db.__opts.remote, 'https://my.cou.ch/name', 'sets remote name to "https://my.cou.ch/name"')
})

test('remoteBaseUrl with trailing /', function (t) {
  t.plan(1)

  var store = new Store('name', merge({ remoteBaseUrl: 'https://my.cou.ch/' }, options))
  t.is(store.db.__opts.remote, 'https://my.cou.ch/name', 'sets remote name without double //')
})

test('new Store("name", {remote: "othername", remoteBaseUrl: "https://example.com"})', function (t) {
  t.plan(1)

  var store = new Store('name', merge({ remote: 'othername', remoteBaseUrl: 'https://my.cou.ch' }, options))
  t.is(store.db.__opts.remote, 'https://my.cou.ch/othername', 'sets remote name to "https://my.cou.ch/othername"')
})

test('new Store("name", {remote: "othername", remoteBaseUrl: "https://example.com"})', function (t) {
  t.plan(1)

  var store = new Store('name', merge({ remote: 'https://my.other.cou.ch/name', remoteBaseUrl: 'https://my.cou.ch' }, options))
  t.is(store.db.__opts.remote, 'https://my.other.cou.ch/name', 'sets remote name to "https://my.cou.ch/othername"')
})

test('constructs a store object without options.adapter / options.db', function (t) {
  var store = new Store('test-db-adapter', { remote: 'test-db-adapter-remote' })

  t.is(typeof store, 'object', 'is object')
  t.ok(store.db, '.db exists')
  t.is(store.db._db_name, 'test-db-adapter', '.db is PouchDB object')

  // clean up the files created by this test
  cleanupDb(store, t)
})

test('Store.defaults({remote})', function (t) {
  t.plan(2)

  var CustomStore = Store.defaults(merge({remote: 'test-db-custom-remote'}, options))
  var store = new CustomStore('test-db-custom')

  t.throws(CustomStore, 'throws without argumens')
  t.is(store.db.__opts.remote, 'test-db-custom-remote', 'sets remote name')
})

test('Store.defaults({remoteBaseUrl})', function (t) {
  t.plan(2)

  var CustomStore = Store.defaults(merge({remoteBaseUrl: 'http://example.com'}, options))
  var store = new CustomStore('test-db-custom')
  var store2 = new CustomStore('test-db-custom2')

  t.is(store.db.__opts.remote, 'http://example.com/test-db-custom', 'sets remote name')
  t.is(store2.db.__opts.remote, 'http://example.com/test-db-custom2', 'sets remote name correcly on multiple instances')
})

function cleanupDb (store, t) {
  // clean up the files created by this test
  if (process.browser) {
    return t.end()
  }
  store.db.then(function () {
    rimraf(store.db._db_name, function (error) {
      if (error) {
        throw error
      }

      t.end()
    })
  })

  .catch(function (error) {
    console.log(error)
  })
}
