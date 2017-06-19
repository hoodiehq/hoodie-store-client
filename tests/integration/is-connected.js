var test = require('tape')

var PouchDB = require('../utils/pouchdb.js')
var Store = require('../../')
var uniqueName = require('../utils/unique-name')

/* create if db does not exist, ping if exists or created */
test('api.isConnected()', function (t) {
  t.plan(1)

  var name = uniqueName()
  var store = new Store(name, {
    PouchDB: PouchDB,
    remote: 'remote-' + name
  })

  t.equal(store.isConnected(), false, 'connection is closed')
})

test('api.isConnected() after connected', function (t) {
  t.plan(1)

  var name = uniqueName()
  var store = new Store(name, {
    PouchDB: PouchDB,
    remote: 'remote-' + name
  })

  store.connect().then(function () {
    t.equal(store.isConnected(), true, 'connection is opened')
  })
})

test('api.isConnected() after disconnected', function (t) {
  t.plan(1)

  var name = uniqueName()
  var store = new Store(name, {
    PouchDB: PouchDB,
    remote: 'remote-' + name
  })

  store.disconnect().then(function () {
    t.equal(store.isConnected(), false, 'connection is closed')
  })
})
