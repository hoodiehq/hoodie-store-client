var test = require('tape')

var PouchDB = require('../utils/pouchdb.js')
var Store = require('../../')
var uniqueName = require('../utils/unique-name')

test('store.one("push")', function (t) {
  t.plan(3)

  var name = uniqueName()
  var remoteDb = new PouchDB('remote-' + name)
  var store = new Store(name, {
    PouchDB: PouchDB,
    remote: remoteDb
  })

  var pushEvents = []
  store.one('push', pushEvents.push.bind(pushEvents))

  var obj1 = {_id: 'test1', foo: 'bar1'}
  var obj2 = {_id: 'test2', foo: 'bar2'}

  store.add([obj1, obj2])

  .then(function () {
    return store.push()
  })

  .then(function () {
    t.is(pushEvents.length, 1, 'triggers 1 push event')
    t.is(pushEvents[0].foo, 'bar1', 'event passes object')
  })

  .then(function () {
    return store.push()
  })

  .then(function () {
    t.is(pushEvents.length, 1, 'triggers no second push event')
  })
})

test('store.one("push") chained', function (t) {
  t.plan(4)

  var name = uniqueName()
  var remoteDb = new PouchDB('remote-' + name)
  var store = new Store(name, {
    PouchDB: PouchDB,
    remote: remoteDb
  })

  var pushEvents = []
  var pushEvents2 = []
  store
    .one('push', pushEvents.push.bind(pushEvents))
    .one('push', pushEvents2.push.bind(pushEvents2))

  var obj1 = {_id: 'test1', foo: 'bar1'}
  var obj2 = {_id: 'test2', foo: 'bar2'}

  store.add([obj1, obj2])

  .then(function () {
    return store.push()
  })

  .then(function () {
    t.is(pushEvents.length, 1, 'triggers 1 push event')
    t.is(pushEvents[0].foo, 'bar1', 'event passes object')
    t.is(pushEvents2.length, 1, 'triggers 1 push event')
    t.is(pushEvents2[0].foo, 'bar1', 'event passes object')
  })
})
