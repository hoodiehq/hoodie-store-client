var test = require('tape')

var Store = require('../../')
var PouchDB = require('../utils/pouchdb.js')
var uniqueName = require('../utils/unique-name')

test('scoped store calls should work after reset (hoodiehq/hoodie#612)', function (t) {
  t.plan(1)

  var name = uniqueName()
  var store = new Store(name, {
    PouchDB: PouchDB,
    remote: 'remote-' + name
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
