var test = require('tape')

var Store = require('../../')
var PouchDB = require('../utils/pouchdb.js')

test('store.sync() ignores deleted remote documents', function (t) {
  var options = {
    PouchDB: PouchDB,
    remote: new PouchDB('test-db')
  }
  var doc = { _id: 'id1234', foo: 'bar' }

  options.remote.put(doc)

  .then(function (response) {
    return options.remote.remove(response.id, response.rev)
  })

  .then(function () {
    return new Store('test-db-local', options)
  })

  .then(function (store) {
    store.on('remove', function () {
      t.fail('No remove event should be emitted')
    })

    store.on('change', function () {
      t.fail('No change event should be emitted')
    })

    store.sync()

    .then(function () {
      t.pass('No remove or change/remove events were emitted')
      t.end()
    })
  })

  .catch(t.catch)
})
