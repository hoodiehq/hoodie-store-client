var test = require('tape')

var PouchDB = require('../utils/pouchdb.js')
var Store = require('../../')
var uniqueName = require('../utils/unique-name')

/* create if db does not exist, ping if exists or created */
test('api.disconnect()', function (t) {
  t.plan(1)
  var name = uniqueName()
  var store = new Store(name, {
    PouchDB: PouchDB,
    remote: 'remote-' + name
  })

  store.disconnect().then(function () {
    t.pass('connection is closed')
  })
})

test('api.disconnect() after connected', function (t) {
  t.plan(1)
  var name = uniqueName()
  var store = new Store(name, {
    PouchDB: PouchDB,
    remote: 'remote-' + name
  })

  store.connect().then(store.disconnect)
  .then(function () {
    t.pass('connection is closed after opening connection')
  })
})
