var test = require('tape')

var PouchDB = require('../utils/pouchdb.js')
var Store = require('../../')
var waitFor = require('../utils/wait-for')
var uniqueName = require('../utils/unique-name')

/* create if db does not exist, ping if exists or created */
test('api.connect()', function (t) {
  t.plan(1)
  var name = uniqueName()
  var store = new Store(name, {
    PouchDB: PouchDB,
    remote: 'remote-' + name
  })

  store.connect().then(function () {
    t.pass('connection is open')
  })

  .catch(t.error)
})

test('api.connect() syncs docs', function (t) {
  t.plan(2)
  var name = uniqueName()
  var remoteDb = new PouchDB('remote-' + name)
  var store = new Store(name, {
    PouchDB: PouchDB,
    remote: remoteDb
  })

  var pullEvents = []
  var pushEvents = []
  store.on('pull', pullEvents.push.bind(pullEvents))
  store.on('push', pushEvents.push.bind(pushEvents))

  return store.connect()

  .then(function () {
    return store.add({_id: 'a'})
  })

  .then(waitFor(function () {
    // I think 1 should be correct here, see
    // https://github.com/pouchdb/pouchdb/issues/4293
    return pushEvents.length >= 1
  }, true))

  .then(function () {
    return remoteDb.put({_id: 'b'})
  })

  .then(waitFor(function () {
    return pullEvents.length >= 1
  }, true))

  .then(function () {
    t.ok(pullEvents.length, 'triggers pull event')
    t.ok(pushEvents.length, 'triggers push event')
  })

  .catch(t.error)
})
