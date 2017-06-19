var test = require('tape')

var PouchDB = require('../utils/pouchdb.js')
var Store = require('../../')
var uniqueName = require('../utils/unique-name')

/* create if db does not exist, ping if exists or created */
test('store.pull() creates 2 db`s and puts data in first, second remains empty', function (t) {
  t.plan(2)
  var name = uniqueName()
  var remoteDbName = 'remote-' + name
  var remoteDb = new PouchDB(remoteDbName)
  var store = new Store(name, {
    PouchDB: PouchDB,
    remote: remoteDb
  })

  store.add({_id: 'test'})

  .then(function () {
    return store.pull()
  })

  .then(function () {
    return remoteDb.info()
  })

  .then(function (info) {
    t.equal(info.db_name, remoteDbName, 'remote db2 exists ')
  })

  .then(function () {
    return store.db.info()
  })

  .then(function (info) {
    t.equal(info.doc_count, 1, 'remote db1 exists and 1 doc got added')
  })
})

test('store.pull()', function (t) {
  t.plan(2)

  var name = uniqueName()
  var remoteDb = new PouchDB('remote-' + name)
  var store = new Store(name, {
    PouchDB: PouchDB,
    remote: remoteDb
  })

  var doc1 = {_id: 'test1', foo1: 'bar1'}
  var doc2 = {_id: 'test2', foo1: 'bar2'}
  remoteDb.bulkDocs([doc1, doc2])

  .then(function () {
    return store.pull() // empty
  })

  .then(function (pulledDocs) {
    t.equal(pulledDocs.length, 2, '2 docs pulled')
    t.equal(pulledDocs[0]._id, 'test1', 'pulledDocs[0]._id match')
  })
})

test('store.pull(string)', function (t) {
  t.plan(2)
  var name = uniqueName()
  var remoteDb = new PouchDB('remote-' + name)
  var store = new Store(name, {
    PouchDB: PouchDB,
    remote: remoteDb
  })

  var doc1 = {_id: 'test1', foo1: 'bar1'}
  var doc2 = {_id: 'test2', foo1: 'bar2'}
  remoteDb.bulkDocs([doc1, doc2])

  .then(function () {
    return store.pull('test1') // string
  })

  .then(function (pulledDocs) {
    t.equal(pulledDocs.length, 1, '1 object pulled')
    t.equal(pulledDocs[0]._id, 'test1', 'pulledDocs[0]._id match')
  })
})

test('store.pull(docs)', function (t) {
  t.plan(3)
  var name = uniqueName()
  var remoteDb = new PouchDB('remote-' + name)
  var store = new Store(name, {
    PouchDB: PouchDB,
    remote: remoteDb
  })

  var doc1 = {_id: 'test1', foo1: 'bar1'}
  var doc2 = {_id: 'test2', foo1: 'bar2'}
  var doc3 = {_id: 'test3', foo1: 'bar3'}
  remoteDb.bulkDocs([doc1, doc2, doc3])

  .then(function () {
    return store.pull([doc1, 'test2']) // docs
  })

  .then(function (pulledDocs) {
    t.equal(pulledDocs.length, 2, '2 docs pulled')
    var ids = [
      pulledDocs[0]._id,
      pulledDocs[1]._id
    ].sort()
    t.equal(ids[0], 'test1', 'pulledDocs[0]._id match')
    t.equal(ids[1], 'test2', 'pulledDocs[1]._id match')
  })
})

test('store.pull(object)', function (t) {
  t.plan(2)
  var name = uniqueName()
  var remoteDb = new PouchDB('remote-' + name)
  var store = new Store(name, {
    PouchDB: PouchDB,
    remote: remoteDb
  })

  var doc1 = {_id: 'test1', foo1: 'bar1'}
  var doc2 = {_id: 'test2', foo1: 'bar2'}
  var doc3 = {_id: 'test3', foo1: 'bar3'}
  remoteDb.bulkDocs([doc1, doc2, doc3])

  .then(function () {
    return store.pull(doc3) // object
  })

  .then(function (pulledDocs) {
    t.equal(pulledDocs.length, 1, '1 object pulled')
    t.equal(pulledDocs[0]._id, 'test3', 'pulledDocs[0]._id match')
  })
})

test('store.pull("inexistentID")', function (t) {
  t.plan(1)

  var name = uniqueName()
  var remoteDb = new PouchDB('remote-' + name)
  var store = new Store(name, {
    PouchDB: PouchDB,
    remote: remoteDb
  })

  var doc1 = {_id: 'test1', foo1: 'bar1'}
  var doc2 = {_id: 'test2', foo1: 'bar2'}
  var doc3 = {_id: 'test3', foo1: 'bar3'}
  store.add([doc1, doc2, doc3])

  .then(function () {
    return store.pull('inexistentID') // string
  })

  .then(function (pulledDocs) {
    t.equal(pulledDocs.length, 0, '0 docs pulled')
  })
})

test('store.pull() when local / remote in sync', function (t) {
  t.plan(2)

  var name = uniqueName()
  var remoteDb = new PouchDB('remote-' + name)
  var store = new Store(name, {
    PouchDB: PouchDB,
    remote: remoteDb
  })

  remoteDb.put({_id: 'test1', foo1: 'bar1'})

  .then(function () {
    return store.pull()
  })

  .then(function (pulledDocs) {
    t.equal(pulledDocs.length, 1, 'pulledDocs length is 1')
    return store.pull()
  })

  .then(function (pulledDocs) {
    t.equal(pulledDocs.length, 0, 'pulledDocs length is 0')
  })
})

test('store.pull(reject)', function (t) {
  t.plan(2)

  var name = uniqueName()
  var remoteDb = new PouchDB('remote-' + name)
  var store = new Store(name, {
    PouchDB: PouchDB,
    remote: remoteDb
  })

  remoteDb.put({_id: 'test1', foo1: 'bar1'})

  .then(function () {
    return store.pull({})
  })

  .catch(function (error) {
    t.pass(error.message)
  })

  .then(function () {
    return store.pull([1, 2, undefined])
  })

  .catch(function () {
    t.pass('One object within the array is undefined')
  })
})

test('store.pull() error', function (t) {
  t.plan(1)

  var name = uniqueName()
  var remoteDb = new PouchDB('remote-' + name)
  var store = new Store(name, {
    PouchDB: PouchDB,
    remote: remoteDb
  })

  var doc1 = {_id: 'test1', foo1: 'bar1'}

  var first = true
  var data = {
    get _id () {
      if (first) {
        first = false
        return 'test1'
      } else {
        throw new Error('ooops')
      }
    },
    foo: 'bar'
  }

  remoteDb.bulkDocs([data, doc1])

  .then(function () {
    return store.pull(data)
  })

  .catch(function () {
    t.pass('The error event was fired!')
  })
})
