var test = require('tape')

var Store = require('../../')
var PouchDB = require('../utils/pouchdb.js')

test('scoped store calls should work after reset (hoodiehq/hoodie#612)', function (t) {
  t.plan(1)

  var store = new Store('test-db-reset', {
    PouchDB: PouchDB,
    remote: 'test-db-reset'
  })

  store.reset()

  .then(function () {
    return store.withIdPrefix('prefix/').findAll()
  })

  .then(function () {
    t.pass('ok')
  })

  .catch(t.error)
})

test('scoped store APIs work after reset (hoodiehq/hoodie-store-client#149)', function (t) {
  t.plan(1)

  var store = new Store('test-db-reset', {
    PouchDB: PouchDB,
    remote: 'test-db-reset'
  })

  var itemStore = store.withIdPrefix('item/')

  store.reset()

  .then(function () {
    return itemStore.findAll()
  })

  .then(function () {
    t.pass('ok')
  })

  .catch(t.error)
})
