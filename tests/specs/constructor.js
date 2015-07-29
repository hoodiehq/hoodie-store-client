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

test('constructs a store object options.adapter / options.db', function (t) {
  var store = new Store('test-db-adapter', { remote: 'test-db-adapter-remote' })

  t.is(typeof store, 'object', 'is object')
  t.ok(store.db, '.db exists')
  t.is(store.db._db_name, 'test-db-adapter', '.db is PouchDB object')

  // clean up the files created by this test
  cleanupDb(store, t)
})

test('Store.defaults({remote})', function (t) {
  var CustomStore = Store.defaults({remote: 'test-db-custom-remote'}, options)
  var store = new CustomStore('test-db-custom')

  t.throws(CustomStore, 'throws without argumens')
  t.is(store.db.__opts.remote, 'test-db-custom-remote', 'sets remote name')

  cleanupDb(store, t)
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
