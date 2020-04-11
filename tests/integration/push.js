var test = require('tape')

var PouchDB = require('../utils/pouchdb.js')
var Store = require('../../')
var uniqueName = require('../utils/unique-name')

/* create if db does not exist, ping if exists or created */
test('store.push() creates new db', function (t) {
  t.plan(1)

  var name = uniqueName()
  var remoteDbName = 'remote-' + name
  var remoteDb = new PouchDB(remoteDbName)
  var store = new Store(name, {
    PouchDB: PouchDB,
    remote: remoteDb
  })

  store.add({_id: 'test'})

  .then(function () {
    return store.push()
  })

  .then(function () {
    return remoteDb.info()
  })

  .then(function (info) {
    t.equal(info.db_name, remoteDbName, 'remote db exists ')
  })
})

test('store.push()', function (t) {
  t.plan(2)

  var name = uniqueName()
  var remoteDb = new PouchDB('remote-' + name)
  var store = new Store(name, {
    PouchDB: PouchDB,
    remote: remoteDb
  })

  store.add({_id: 'test1', foo1: 'bar1'})

  .then(function () {
    return store.push() // empty
  })

  .then(function (pushedDocs) {
    t.equal(pushedDocs.length, 1, 'pushedDocs length is 1')
    t.equal(pushedDocs[0]._id, 'test1', 'pushedDocs[0]._id match')
  })
})

test('store.push(string)', function (t) {
  t.plan(2)

  var name = uniqueName()
  var remoteDb = new PouchDB('remote-' + name)
  var store = new Store(name, {
    PouchDB: PouchDB,
    remote: remoteDb
  })

  var doc1 = {_id: 'test1', foo1: 'bar1'}
  var doc2 = {_id: 'test2', foo1: 'bar2'}

  store.add([doc1, doc2])

  .then(function () {
    return store.push('test1') // string
  })

  .then(function (pushedDocs) {
    t.equal(pushedDocs.length, 1, '1 doc pushed')
    t.equal(pushedDocs[0]._id, 'test1', 'pushedDocs[0]._id match')
  })
})

test('store.push(docs)', function (t) {
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

  store.add([doc1, doc2, doc3])

  .then(function () {
    return store.push([doc1, 'test2']) // array
  })

  .then(function (pushedDocs) {
    t.equal(pushedDocs.length, 2, '2 docs pushed')
    var ids = [
      pushedDocs[0]._id,
      pushedDocs[1]._id
    ].sort()
    t.equal(ids[0], 'test1', 'pushedDocs[0]._id match')
    t.equal(ids[1], 'test2', 'pushedDocs[1]._id match')
  })
})

test('store.push(doc)', function (t) {
  t.plan(2)

  var name = uniqueName()
  var remoteDb = new PouchDB('remote-' + name)
  var store = new Store(name, {
    PouchDB: PouchDB,
    remote: remoteDb
  })

  var doc1 = {_id: 'test1', foo1: 'bar1'}
  var doc2 = {_id: 'test2', foo1: 'bar2'}

  store.add([doc1, doc2])

  .then(function () {
    return store.push(doc1) // doc
  })

  .then(function (pushedDocs) {
    t.equal(pushedDocs.length, 1, '1 doc pushed')
    t.equal(pushedDocs[0]._id, 'test1', 'pushedDocs[0]._id match')
  })
})

test('store.push("inexistentID")', function (t) {
  t.plan(1)

  var name = uniqueName()
  var remoteDb = new PouchDB('remote-' + name)
  var store = new Store(name, {
    PouchDB: PouchDB,
    remote: remoteDb
  })

  var doc1 = {_id: 'test1', foo1: 'bar1'}
  var doc2 = {_id: 'test2', foo1: 'bar2'}

  store.add([doc1, doc2])

  .then(function () {
    return store.push('inexistentID') // string
  })

  .then(function (pushedDocs) {
    t.equal(pushedDocs.length, 0, '0 docs pushed')
  })
})

test('store.push() when local / remote in sync', function (t) {
  t.plan(2)

  var name = uniqueName()
  var remoteDb = new PouchDB('remote-' + name)
  var store = new Store(name, {
    PouchDB: PouchDB,
    remote: remoteDb
  })

  store.add({_id: 'test1', foo1: 'bar1'})

  .then(function () {
    return store.push()
  })

  .then(function (pushedDocs) {
    t.equal(pushedDocs.length, 1, 'pushedDocs length is 1')
    return store.push()
  })
  .then(function (pushedDocs) {
    t.equal(pushedDocs.length, 0, 'pushedDocs length is 0')
  })
})

test('store.push({}) rejects', function (t) {
  t.plan(5)

  var name = uniqueName()
  var remoteDb = new PouchDB('remote-' + name)
  var store = new Store(name, {
    PouchDB: PouchDB,
    remote: remoteDb
  })

  var doc1 = {_id: 'test1', foo1: 'bar1'}
  var doc2 = {_id: 'test2', foo1: 'bar2'}

  store.add([doc1, doc2])

  .then(function () {
    return store.push({})
  })

  .catch(function (error) {
    t.is(error.status, 400, 'Rejects with not an NOT_AN_OBJECT status')
    t.is(error.message, 'Document must be a JSON object', 'Rejects with not an NOT_AN_OBJECT')
  })

  .then(function () {
    return store.push([1, 2, undefined])
  })

  .catch(function (error) {
    t.is(error.status, 400, 'Rejects with not an NOT_AN_OBJECT status')
    t.is(error.message, 'Document must be a JSON object', 'Rejects with not an NOT_AN_OBJECT')
    t.pass('One doc within the array is undefined')
  })
})

test('store.push() error', function (t) {
  t.plan(1)

  var name = uniqueName()
  var remoteDb = new PouchDB('remote-' + name)
  var store = new Store(name, {
    PouchDB: PouchDB,
    remote: remoteDb
  })

  store.add({_id: 'test1', foo1: 'bar1'})

  .then(function () {
    return store.push({
      get _id () {
        throw new Error('ooops')
      }
    })
  })

  .catch(function () {
    t.pass('The error event was fired!')
  })
})
