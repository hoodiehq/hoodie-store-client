var test = require('tape')

var PouchDB = require('../utils/pouchdb.js')
var Store = require('../../')
var uniqueName = require('../utils/unique-name')

test('store.off("push")', function (t) {
  t.plan(2)

  var name = uniqueName()
  var store = new Store(name, {
    PouchDB: PouchDB,
    remote: 'remote-' + name
  })

  var pushEvents = []
  store.on('push', pushHandler)
  function pushHandler (doc) {
    pushEvents.push(doc)
  }

  var obj1 = {_id: 'test1', foo1: 'bar1'}
  var obj2 = {_id: 'test2', foo1: 'bar2'}

  store.add([obj1, obj2])

  .then(function () {
    return store.push('test2')
  })

  .then(function () {
    t.is(pushEvents.length, 1, 'triggers 1 push event')

    store.off('push', pushHandler)
    return store.push('test1')
  })

  .then(function () {
    t.is(pushEvents.length, 1, 'push event was removed')
  })
})

test('store.off("push"), 2 handlers, passing 1, removing 1', function (t) {
  t.plan(2)

  var name = uniqueName()
  var store = new Store(name, {
    PouchDB: PouchDB,
    remote: 'remote-' + name
  })

  var pushEvents1 = []
  store.on('push', pushHandler1)
  function pushHandler1 (doc) {
    pushEvents1.push(doc)
  }

  var pushEvents2 = []
  store.on('push', pushHandler2)
  function pushHandler2 (doc) {
    pushEvents2.push(doc)
  }

  var obj1 = {_id: 'test1', foo1: 'bar1'}
  var obj2 = {_id: 'test2', foo1: 'bar2'}

  store.add([obj1, obj2])

  .then(function () {
    return store.push('test2')
  })

  .then(function () {
    t.is(pushEvents1.length, 1, 'triggers 1 push event')

    store.off('push', pushHandler1)
    return store.push('test1')
  })

  .then(function () {
    t.is(pushEvents1.length, 1, 'push event was removed')
  })
})

test('store.off("push"), 2 handlers, removing all', function (t) {
  t.plan(2)

  var name = uniqueName()
  var store = new Store(name, {
    PouchDB: PouchDB,
    remote: 'remote-' + name
  })

  var pushEvents1 = []
  var pushEvents2 = []

  store
    .on('push', pushHandler1)
    .on('push', pushHandler2)
    .off('push', pushHandler1)
    .off('push', pushHandler2)

  function pushHandler1 (doc) {
    pushEvents1.push(doc)
  }
  function pushHandler2 (doc) {
    pushEvents2.push(doc)
  }

  var obj1 = {_id: 'test1', foo1: 'bar1'}
  var obj2 = {_id: 'test2', foo1: 'bar2'}

  store.add([obj1, obj2])

  .then(function () {
    return store.push('test2')
  })

  .then(function () {
    t.is(pushEvents1.length, 0, 'all push events were removed')
    t.is(pushEvents2.length, 0, 'all push events were removed')
  })
})
