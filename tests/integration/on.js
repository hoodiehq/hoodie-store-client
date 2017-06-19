var test = require('tape')

var PouchDB = require('../utils/pouchdb.js')
var Store = require('../../')
var uniqueName = require('../utils/unique-name')
var waitFor = require('../utils/wait-for')

test('store.on("push") for store.push()', function (t) {
  t.plan(2)

  var name = uniqueName()
  var store = new Store(name, {
    PouchDB: PouchDB,
    remote: 'remote-' + name
  })

  var pushEvents = []
  store.on('push', pushEvents.push.bind(pushEvents))

  store.add({_id: 'test', foo: 'bar'})

  .then(function () {
    return store.push()
  })

  .then(function () {
    t.is(pushEvents.length, 1, 'triggers 1 push event')
    t.is(pushEvents[0].foo, 'bar', 'event passes object')
  })
})

test('store.on("push") for store.pull()', function (t) {
  t.plan(1)

  var name = uniqueName()
  var remoteDb = new PouchDB('remote-' + name)
  var store = new Store(name, {
    PouchDB: PouchDB,
    remote: remoteDb
  })

  var obj1 = {_id: 'test1', foo1: 'bar1'}
  var obj2 = {_id: 'test2', foo1: 'bar2'}

  var pushEvents = []
  store.on('push', pushEvents.push.bind(pushEvents))

  remoteDb.bulkDocs([obj1, obj2])

  .then(function () {
    return store.pull()
  })

  .then(function () {
    t.is(pushEvents.length, 0, 'triggers no push events')
  })
})

test('store.on("pull") for store.pull()', function (t) {
  t.plan(3)

  var name = uniqueName()
  var remoteDb = new PouchDB('remote-' + name)
  var store = new Store(name, {
    PouchDB: PouchDB,
    remote: remoteDb
  })

  var obj1 = {_id: 'test1', foo: 'bar1'}
  var obj2 = {_id: 'test2', foo: 'bar2'}

  var pullEvents = []
  store.on('pull', pullEvents.push.bind(pullEvents))

  remoteDb.bulkDocs([obj1, obj2])

  .then(function () {
    return store.pull()
  })

  .then(function () {
    t.is(pullEvents.length, 2, 'triggers pull event twice')
    var foo = [
      pullEvents[0].foo,
      pullEvents[1].foo
    ].sort()
    t.is(foo[0], 'bar1', 'event passes object1')
    t.is(foo[1], 'bar2', 'event passes object2')
  })
})

test('store.on("pull") for store.push()', function (t) {
  t.plan(1)

  var name = uniqueName()
  var remoteDb = new PouchDB('remote-' + name)
  var store = new Store(name, {
    PouchDB: PouchDB,
    remote: remoteDb
  })

  var pullEvents = []
  store.on('pull', pullEvents.push.bind(pullEvents))

  store.add({_id: 'test', foo: 'bar'})

  .then(function () {
    return store.push()
  })

  .then(function () {
    t.is(pullEvents.length, 0, 'triggers no pull events')
  })
})

test('store.on("pull") / store.on("push") for store.sync()', function (t) {
  t.plan(5)
  var name = uniqueName()
  var remoteDb = new PouchDB('remote-' + name)
  var store = new Store(name, {
    PouchDB: PouchDB,
    remote: remoteDb
  })

  var pushEvents = []
  var pullEvents = []
  store
    .on('push', pushEvents.push.bind(pushEvents))
    .on('pull', pullEvents.push.bind(pullEvents))

  var localObj1 = {_id: 'test3', foo1: 'bar3'}
  var localObj2 = {_id: 'test4', foo1: 'bar4'}
  var remoteObj1 = {_id: 'test1', foo1: 'bar1'}
  var remoteObj2 = {_id: 'test2', foo1: 'bar2'}

  Promise.all([
    store.add([localObj1, localObj2]),
    remoteDb.bulkDocs([remoteObj1, remoteObj2])
  ])

  .then(function () {
    return store.sync()
  })

  .then(function (syncedObjects) {
    t.is(pushEvents.length, 2, 'triggers push event twice')
    t.is(pullEvents.length, 2, 'triggers pull event twice')
    t.is(syncedObjects.length, 4, 'syncedObjects length is 4')

    return Promise.all([
      store.db.info(),
      remoteDb.info()
    ])
  })

  .then(function (info) {
    t.equal(info[0].doc_count, 4, '4 docs in db1')
    t.equal(info[1].doc_count, 4, '4 docs in db2')
  })
})

test('store.on("push") after store.push()', function (t) {
  t.plan(2)

  var name = uniqueName()
  var remoteDb = new PouchDB('remote-' + name)
  var store = new Store(name, {
    PouchDB: PouchDB,
    remote: remoteDb
  })
  var pushEvents = []

  store.add([
    {_id: 'test1'},
    {_id: 'test2'}
  ])

  .then(function () {
    return store.push('test1')
  })

  .then(function () {
    store.on('push', pushEvents.push.bind(pushEvents))

    return store.push('test2')
  })

  .then(waitFor(function () {
    return pushEvents.length
  }, 1))

  .then(function (info) {
    t.is(pushEvents.length, 1, 'triggers 1 push event')
    t.is(pushEvents[0]._id, 'test2')
  })
})

test('store.on("pull") after store.pull()', function (t) {
  t.plan(2)

  var name = uniqueName()
  var remoteDb = new PouchDB('remote-' + name)
  var store = new Store(name, {
    PouchDB: PouchDB,
    remote: remoteDb
  })
  var pullEvents = []

  remoteDb.bulkDocs([
    {_id: 'test1', foo: 'bar1'},
    {_id: 'test2', foo: 'bar2'}
  ])

  .then(function () {
    return store.pull('test1')
  })

  .then(function () {
    store.on('pull', pullEvents.push.bind(pullEvents))

    return store.pull('test2')
  })

  .then(waitFor(function () {
    return pullEvents.length
  }, 1))

  .then(function () {
    t.is(pullEvents.length, 1, 'triggers 1 push event')
    t.is(pullEvents[0].foo, 'bar2', 'triggers for right object')
  })
})

test('store.on("connect") for store.connect()', function (t) {
  t.plan(1)

  var name = uniqueName()
  var remoteDb = new PouchDB('remote-' + name)
  var store = new Store(name, {
    PouchDB: PouchDB,
    remote: remoteDb
  })

  var numConnectEvents = 0
  store.on('connect', function () {
    numConnectEvents += 1
  })

  store.connect()

  .then(function () {
    t.is(numConnectEvents, 1)
  })
})

test('store.on("connect") for multiple store.connect() calls', function (t) {
  t.plan(1)

  var name = uniqueName()
  var remoteDb = new PouchDB('remote-' + name)
  var store = new Store(name, {
    PouchDB: PouchDB,
    remote: remoteDb
  })

  var numConnectEvents = 0
  store.on('connect', function () {
    numConnectEvents += 1
  })

  Promise.resolve([
    store.connect(),
    store.connect()
  ])

  .then(function () {
    t.is(numConnectEvents, 1)
  })
})

test('store.on("disconnect") for store.disconnect()', function (t) {
  t.plan(1)

  var name = uniqueName()
  var remoteDb = new PouchDB('remote-' + name)
  var store = new Store(name, {
    PouchDB: PouchDB,
    remote: remoteDb
  })

  var numDisconnectEvents = 0
  store.on('disconnect', function () {
    numDisconnectEvents += 1
  })

  store.disconnect()

  .then(function () {
    t.is(numDisconnectEvents, 0)
  })
})

test('store.on("disconnect") for store.disconnect() after store.connect()', function (t) {
  t.plan(1)

  var name = uniqueName()
  var remoteDb = new PouchDB('remote-' + name)
  var store = new Store(name, {
    PouchDB: PouchDB,
    remote: remoteDb
  })

  var numDisconnectEvents = 0
  store.on('disconnect', function () {
    numDisconnectEvents += 1
  })

  store.connect()

  .then(store.disconnect)

  .then(function () {
    t.is(numDisconnectEvents, 1)
  })
})
