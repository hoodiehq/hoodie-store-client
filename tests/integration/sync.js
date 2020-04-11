var test = require('tape')

var Store = require('../../')
var PouchDB = require('../utils/pouchdb.js')
var uniqueName = require('../utils/unique-name')

test('store.push() returns hoodie objects', function (t) {
  t.plan(3)

  var name = uniqueName()
  var store = new Store(name, {
    PouchDB: PouchDB,
    remote: 'remote-' + name
  })
  var doc1 = {_id: 'test1', foo: 'bar1'}
  var doc2 = {_id: 'test2', foo: 'bar2'}

  store.add([doc1, doc2])

  .then(function () {
    return store.push()
  })

  .then(function (pushedDocs) {
    t.is(pushedDocs.length, 2, '2 items returned')
    t.is(pushedDocs[0]._id, 'test1', 'returns hoodie doc')
    t.is(pushedDocs[1].foo, 'bar2', 'returns hoodie doc')
  })

  .catch(t.error)
})

test('store.push(docsOrIds) returns hoodie objects', function (t) {
  t.plan(3)

  var name = uniqueName()
  var store = new Store(name, {
    PouchDB: PouchDB,
    remote: 'remote-' + name
  })
  var doc1 = {_id: 'test1', foo: 'bar1'}
  var doc2 = {_id: 'test2', foo: 'bar2'}

  store.add([doc1, doc2])

  .then(function (addedDocs) {
    return store.push(addedDocs)
  })

  .then(function (pushedDocs) {
    t.is(pushedDocs.length, 2, '2 items returned')
    t.is(pushedDocs[0]._id, 'test1', 'returns hoodie doc')
    t.is(pushedDocs[1].foo, 'bar2', 'returns hoodie doc')
  })

  .catch(t.fail)
})

test('store.sync() returns hoodie objects', function (t) {
  t.plan(3)

  var name = uniqueName()
  var store = new Store(name, {
    PouchDB: PouchDB,
    remote: 'remote-' + name
  })
  var doc1 = {_id: 'test1', foo: 'bar1'}
  var doc2 = {_id: 'test2', foo: 'bar2'}

  store.add([doc1, doc2])

  .then(function () {
    return store.sync()
  })

  .then(function (pushedDocs) {
    t.is(pushedDocs.length, 2, '2 items returned')
    t.is(pushedDocs[0]._id, 'test1', 'returns hoodie doc')
    t.is(pushedDocs[1].foo, 'bar2', 'returns hoodie doc')
  })

  .catch(t.fail)
})

test('store.on("push") for store.push()', function (t) {
  t.plan(3)

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
    t.is(pushEvents[0]._id, 'test', 'event passes doc')
    t.is(pushEvents[0].foo, 'bar', 'event passes doc')
  })

  .catch(t.fail)
})

test('api.off("push")', function (t) {
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

  var doc1 = {_id: 'test1', foo1: 'bar1'}
  var doc2 = {_id: 'test2', foo1: 'bar2'}

  store.add([doc1, doc2])

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

  .catch(t.fail)
})

test('api.one("push")', function (t) {
  t.plan(4)

  var name = uniqueName()
  var store = new Store(name, {
    PouchDB: PouchDB,
    remote: 'remote-' + name
  })
  var pushEvents = []

  store.one('push', pushEvents.push.bind(pushEvents))

  var doc1 = {_id: 'test1', foo: 'bar1'}
  var doc2 = {_id: 'test2', foo: 'bar2'}

  store.add([doc1, doc2])

  .then(function () {
    return store.push()
  })

  .then(function () {
    t.is(pushEvents.length, 1, 'triggers 1 push event')
    t.is(pushEvents[0]._id, 'test1', 'event passes doc')
    t.is(pushEvents[0].foo, 'bar1', 'event passes doc')
  })

  .then(function () {
    return store.push()
  })

  .then(function () {
    t.is(pushEvents.length, 1, 'triggers no second push event')
  })

  .catch(t.fail)
})

test('api.on("connect") for api.connect()', function (t) {
  t.plan(1)

  var name = uniqueName()
  var store = new Store(name, {
    PouchDB: PouchDB,
    remote: 'remote-' + name
  })
  var numConnectEvents = 0

  store.on('connect', function () {
    numConnectEvents += 1
  })

  store.connect()

  .then(function () {
    t.is(numConnectEvents, 1, '"connect" event triggered')
  })

  .catch(t.fail)
})

test('triggers "change" events on pull', function (t) {
  t.plan(9)

  var name = uniqueName()
  var store = new Store(name, {
    PouchDB: PouchDB,
    remote: 'remote-' + name
  })
  var remoteDb = new PouchDB('remote-' + name)

  var changeEvents = []
  var addEvents = []
  var updateEvents = []
  var removeEvents = []

  store.on('change', function (eventName, doc, options) {
    changeEvents.push({
      event: eventName,
      doc: doc,
      options: options
    })
  })

  store.on('add', function (doc, options) {
    addEvents.push({
      doc: doc,
      options: options
    })
  })

  store.on('update', function (doc, options) {
    updateEvents.push({
      doc: doc,
      options: options
    })
  })

  store.on('remove', function (doc, options) {
    removeEvents.push({
      doc: doc,
      options: options
    })
  })

  var doc = {_id: 'test', foo: 'bar', hoodie: {createdAt: '1970-01-01T00:00:00.000Z'}}
  remoteDb.put(doc)

  .then(function (response) {
    doc._rev = response.rev
    return store.pull()
  })

  .then(function () {
    doc.foo = 'baz'
    doc.hoodie.updatedAt = '1970-01-01T00:00:00.000Z'

    return remoteDb.put(doc)
  })

  .then(function (response) {
    doc._rev = response.rev
    return store.pull()
  })

  .then(function () {
    doc._deleted = true
    doc.hoodie.deletedAt = '1970-01-01T00:00:00.000Z'
    doc.foo = 'boo'
    return remoteDb.put(doc)
  })

  .then(function () {
    return store.pull()
  })

  .then(function () {
    t.is(changeEvents.length, 3, '"change" events triggered')
    t.is(changeEvents[0].event, 'add', '"change" triggered with event name')
    t.is(changeEvents[0].doc.foo, 'bar', '"change" triggered with doc')

    t.is(addEvents.length, 1, '"add" event triggered')
    t.is(addEvents[0].doc.foo, 'bar', '"add" triggered with doc')

    t.is(updateEvents.length, 1, '"update" event triggered')
    t.is(updateEvents[0].doc.foo, 'baz', '"update" triggered with doc')

    t.is(removeEvents.length, 1, '"remove" event triggered')
    t.is(removeEvents[0].doc.foo, 'boo', '"remove" triggered with doc')
  })

  .catch(t.fail)
})

test('after reset, store.on("push") for store.push()', function (t) {
  t.plan(3)

  var name = uniqueName()
  var store = new Store(name, {
    PouchDB: PouchDB,
    remote: 'remote-' + name
  })
  var pushEvents = []

  store.on('push', pushEvents.push.bind(pushEvents))

  store.reset()

  .then(function () {
    return store.add({_id: 'test', foo: 'bar'})
  })

  .then(function () {
    return store.push()
  })

  .then(function () {
    t.is(pushEvents.length, 1, 'triggers 1 push event')
    t.is(pushEvents[0]._id, 'test', 'event passes doc')
    t.is(pushEvents[0].foo, 'bar', 'event passes doc')
  })

  .catch(t.fail)
})

test('store.sync() with options.remote being a promise', function (t) {
  t.plan(3)

  var remoteDb = new PouchDB('test-db-sync-promise-remote')
  var name = uniqueName()
  var store = new Store(name, {
    PouchDB: PouchDB,
    remote: Promise.resolve(remoteDb)
  })
  var doc1 = {_id: 'test1', foo: 'bar1'}
  var doc2 = {_id: 'test2', foo: 'bar2'}

  store.add([doc1, doc2])

  .then(function () {
    return store.sync()
  })

  .then(function (pushedDocs) {
    t.is(pushedDocs.length, 2, '2 items returned')
    t.is(pushedDocs[0]._id, 'test1', 'returns hoodie doc')
    t.is(pushedDocs[1].foo, 'bar2', 'returns hoodie doc')
  })

  .catch(t.fail)
})

test('store.sync()', function (t) {
  t.plan(3)

  var name = uniqueName()
  var remoteDbName = 'remote-' + name
  var remoteDb = new PouchDB(remoteDbName)
  var store = new Store(name, {
    PouchDB: PouchDB,
    remote: remoteDb
  })

  var remoteDoc1 = {_id: 'test1', foo1: 'bar1'}
  var remoteDoc2 = {_id: 'test2', foo1: 'bar2'}

  store.add([remoteDoc1, remoteDoc2])

  .then(function () {
    return remoteDb.put({_id: 'test3', foo1: 'bar3'})
  })

  .then(function () {
    return store.sync()
  })

  .then(function (syncedDocs) {
    t.equal(syncedDocs.length, 3, '3 objects synced in db1 and db2')
  })
  .then(function () {
    return store.db.info()
  })
  .then(function (info) {
    t.equal(info.doc_count, 3, '3 docs in db1')
  })
  .then(function () {
    return remoteDb.info()
  })
  .then(function (info) {
    t.equal(info.doc_count, 3, '3 docs in db2')
  })
})

test('store.sync()', function (t) {
  t.plan(7)

  var name = uniqueName()
  var remoteDb = new PouchDB('remote-' + name)
  var store = new Store(name, {
    PouchDB: PouchDB,
    remote: remoteDb
  })

  var remoteDoc1 = {_id: 'test1', foo1: 'bar1'}
  var remoteDoc2 = {_id: 'test2', foo1: 'bar2'}
  var localDoc1 = {_id: 'test3', foo1: 'bar3'}
  var localDoc2 = {_id: 'test4', foo1: 'bar4'}

  remoteDb.bulkDocs([remoteDoc1, remoteDoc2])

  .then(function () {
    return store.add([localDoc1, localDoc2])
  })

  .then(function () {
    return store.sync() // empty
  })

  .then(function (syncedDocs) {
    t.equal(syncedDocs.length, 4, '4 objects synced in db3 and db4')
    var ids = [
      syncedDocs[0]._id,
      syncedDocs[1]._id,
      syncedDocs[2]._id,
      syncedDocs[3]._id
    ].sort()

    t.equal(ids[0], 'test1', 'syncedDocs[0]._id match')
    t.equal(ids[1], 'test2', 'syncedDocs[1]._id match')
    t.equal(ids[2], 'test3', 'syncedDocs[2]._id match')
    t.equal(ids[3], 'test4', 'syncedDocs[3]._id match')

    return remoteDb.info()
  })

  .then(function (info) {
    t.equal(info.doc_count, 4, '4 docs in remoteDb')

    return store.db.info()
  })

  .then(function (info) {
    t.equal(info.doc_count, 4, '4 docs in local db')
  })

  .catch(t.error)
})

test('store.sync(string)', function (t) {
  t.plan(4)

  var name = uniqueName()
  var remoteDb = new PouchDB('remote-' + name)
  var store = new Store(name, {
    PouchDB: PouchDB,
    remote: remoteDb
  })

  var remoteDoc1 = {_id: 'test1', foo1: 'bar1'}
  var remoteDoc2 = {_id: 'test2', foo1: 'bar2'}
  var localDoc1 = {_id: 'test3', foo1: 'bar3'}
  var localDoc2 = {_id: 'test4', foo1: 'bar4'}

  remoteDb.bulkDocs([remoteDoc1, remoteDoc2])

  .then(function () {
    return store.add([localDoc1, localDoc2])
  })

  .then(function () {
    return store.sync('test3') // string
  })

  .then(function (syncedDocs) {
    t.equal(syncedDocs.length, 1, '1 object synced to db6')
    t.equal(syncedDocs[0]._id, 'test3', 'syncedDocs[0]._id match')
  })

  .then(function () {
    return store.db.info()
  })

  .then(function (info) {
    t.equal(info.doc_count, 2, '2 docs in local db, like before sync')
  })

  .then(function () {
    return remoteDb.info()
  })

  .then(function (info) {
    t.equal(info.doc_count, 3, '3 docs in remote db, 1 obj from local db got synced')
  })
})

test('store.sync(objects)', function (t) {
  t.plan(5)

  var name = uniqueName()
  var remoteDb = new PouchDB('remote-' + name)
  var store = new Store(name, {
    PouchDB: PouchDB,
    remote: remoteDb
  })

  var remoteDoc1 = {_id: 'test1', foo1: 'bar1'}
  var remoteDoc2 = {_id: 'test2', foo1: 'bar2'}
  var localDoc1 = {_id: 'test3', foo1: 'bar3'}
  var localDoc2 = {_id: 'test4', foo1: 'bar4'}

  remoteDb.bulkDocs([remoteDoc1, remoteDoc2])

  .then(function () {
    return store.add([localDoc1, localDoc2])
  })

  .then(function () {
    return store.sync([remoteDoc1, 'test3']) // objects
  })

  .then(function (syncedDocs) {
    t.equal(syncedDocs.length, 2, '2 objects synced')
    var ids = [
      syncedDocs[0]._id,
      syncedDocs[1]._id
    ].sort()

    t.equal(ids[0], 'test1', 'syncedDocs[0]._id match')
    t.equal(ids[1], 'test3', 'syncedDocs[1]._id match')
  })

  .then(function () {
    return store.db.info()
  })

  .then(function (info) {
    t.equal(info.doc_count, 3, '3 docs in local db, like before sync')
  })

  .then(function () {
    return remoteDb.info()
  })

  .then(function (info) {
    t.equal(info.doc_count, 3, '2 docs in remote DB, 1 obj from remote DB got synced')
  })
})

test('store.sync(object)', function (t) {
  t.plan(4)

  var name = uniqueName()
  var remoteDb = new PouchDB('remote-' + name)
  var store = new Store(name, {
    PouchDB: PouchDB,
    remote: remoteDb
  })

  var remoteDoc1 = {_id: 'test1', foo1: 'bar1'}
  var remoteDoc2 = {_id: 'test2', foo1: 'bar2'}
  var localDoc1 = {_id: 'test3', foo1: 'bar3'}
  var localDoc2 = {_id: 'test4', foo1: 'bar4'}

  remoteDb.bulkDocs([remoteDoc1, remoteDoc2])

  .then(function () {
    return store.add([localDoc1, localDoc2])
  })

  .then(function () {
    return store.sync(remoteDoc2) // object
  })

  .then(function (syncedDocs) {
    t.equal(syncedDocs.length, 1, '1 object synced')
    t.equal(syncedDocs[0]._id, 'test2', 'syncedDocs[0]._id match')
  })
  .then(function () {
    return remoteDb.info()
  })
  .then(function (info) {
    t.equal(info.doc_count, 2, '2 docs in remote DB, like before sync')
  })
  .then(function () {
    return store.db.info()
  })
  .then(function (info) {
    t.equal(info.doc_count, 3, '3 docs in localDB, 1 obj from remote Db got synced')
  })
})

test('store.sync("inexistentID")', function (t) {
  t.plan(3)

  var name = uniqueName()
  var remoteDb = new PouchDB('remote-' + name)
  var store = new Store(name, {
    PouchDB: PouchDB,
    remote: remoteDb
  })

  var remoteDoc1 = {_id: 'test1', foo1: 'bar1'}
  var remoteDoc2 = {_id: 'test2', foo1: 'bar2'}
  var localDoc1 = {_id: 'test3', foo1: 'bar3'}
  var localDoc2 = {_id: 'test4', foo1: 'bar4'}

  remoteDb.bulkDocs([remoteDoc1, remoteDoc2])

  .then(function () {
    return store.add([localDoc1, localDoc2])
  })

  .then(function () {
    return store.sync('inexistentID') // string
  })

  .then(function (syncedDocs) {
    t.equal(syncedDocs.length, 0, '0 object synced to db11, object not found')
  })
  .then(function () {
    return remoteDb.info()
  })
  .then(function (info) {
    t.equal(info.doc_count, 2, '2 docs in remote DB, like before sync')
  })
  .then(function () {
    return store.db.info()
  })
  .then(function (info) {
    t.equal(info.doc_count, 2, '3 docs in local DB, like before sync')
  })
})

test('store.sync(), when local / remote in sync', function (t) {
  t.plan(8)

  var name = uniqueName()
  var remoteDb = new PouchDB('remote-' + name)
  var store = new Store(name, {
    PouchDB: PouchDB,
    remote: remoteDb
  })

  var remoteDoc1 = {_id: 'test1', foo1: 'bar1'}
  var remoteDoc2 = {_id: 'test2', foo1: 'bar2'}
  var localDoc1 = {_id: 'test3', foo1: 'bar3'}
  var localDoc2 = {_id: 'test4', foo1: 'bar4'}

  remoteDb.bulkDocs([remoteDoc1, remoteDoc2])

  .then(function () {
    return store.add([localDoc1, localDoc2])
  })

  .then(function () {
    return store.sync()
  })

  .then(function (syncedDocs) {
    t.equal(syncedDocs.length, 4, '4 objects synced to db13 / db14')
    var ids = [
      syncedDocs[0]._id,
      syncedDocs[1]._id,
      syncedDocs[2]._id,
      syncedDocs[3]._id
    ].sort()

    t.equal(ids[0], 'test1', 'syncedDocs[0]._id match')
    t.equal(ids[1], 'test2', 'syncedDocs[1]._id match')
    t.equal(ids[2], 'test3', 'syncedDocs[2]._id match')
    t.equal(ids[3], 'test4', 'syncedDocs[3]._id match')
    return store.sync()
  })

  .then(function (syncedDocs) {
    t.equal(syncedDocs.length, 0, '0 object synced')
  })

  .then(function () {
    return remoteDb.info()
  })

  .then(function (info) {
    t.equal(info.doc_count, 4, '4 docs in remote DB')
  })

  .then(function () {
    return store.db.info()
  })

  .then(function (info) {
    t.equal(info.doc_count, 4, '4 docs in local db')
  })
})

test('store.sync({}) rejects', function (t) {
  t.plan(5)

  var name = uniqueName()
  var remoteDb = new PouchDB('remote-' + name)
  var store = new Store(name, {
    PouchDB: PouchDB,
    remote: remoteDb
  })

  var remoteDoc1 = {_id: 'test1', foo1: 'bar1'}
  var remoteDoc2 = {_id: 'test2', foo1: 'bar2'}
  var localDoc1 = {_id: 'test3', foo1: 'bar3'}
  var localDoc2 = {_id: 'test4', foo1: 'bar4'}

  remoteDb.bulkDocs([remoteDoc1, remoteDoc2])

  .then(function () {
    return store.add([localDoc1, localDoc2])
  })

  .then(function () {
    return store.sync({})
  })

  .catch(function (error) {
    t.is(error.status, 400, 'Rejects with not an NOT_AN_OBJECT status')
    t.is(error.message, 'Document must be a JSON object', 'Rejects with not an NOT_AN_OBJECT')
  })

  .then(function () {
    return store.sync([1, 2, undefined])
  })

  .catch(function (error) {
    t.is(error.status, 400, 'Rejects with not an NOT_AN_OBJECT status')
    t.is(error.message, 'Document must be a JSON object', 'Rejects with not an NOT_AN_OBJECT')
    t.pass('One object within the array is undefined')
  })
})

test('store.sync(error)', function (t) {
  t.plan(1)

  var name = uniqueName()
  var remoteDb = new PouchDB('remote-' + name)
  var store = new Store(name, {
    PouchDB: PouchDB,
    remote: remoteDb
  })

  var remoteDoc1 = {_id: 'test1', foo1: 'bar1'}
  var remoteDoc2 = {_id: 'test2', foo1: 'bar2'}
  var localDoc1 = {_id: 'test3', foo1: 'bar3'}
  var localDoc2 = {_id: 'test4', foo1: 'bar4'}

  remoteDb.bulkDocs([remoteDoc1, remoteDoc2])

  .then(function () {
    return store.add([localDoc1, localDoc2])
  })

  .then(function () {
    return store.sync({
      get _id () {
        throw new Error('ooops')
      }
    })
  })

  .catch(function () {
    t.pass('The error event was fired!')
  })
})

test('store.sync()', function (t) {
  t.plan(1)

  var name = uniqueName()
  var remoteDb = new PouchDB('remote-' + name)
  var store = new Store(name, {
    PouchDB: PouchDB,
    remote: remoteDb
  })

  store.add({_id: 'test1', foo1: 'bar1'})

  .then(function () {
    return store.sync({_id: 'test1'})
  })

  .then(function (syncedDocs) {
    t.equal(syncedDocs.length, 1, 'doc with ._id synced successfully')
  })
})
