'use strict'

var test = require('tape')

var Store = require('../../')
var options = process.browser ? {
  adapter: 'memory'
} : {
  db: require('memdown')
}

test('has "unsynced-local-docs" methods', function (t) {
  t.plan(1)

  var store = new Store('test-db-unsynced-local-docs', options)

  t.is(typeof store.findAllUnsynced, 'function', 'has "findAllUnsynced" method')
})

test('returns docs with "id" prop', function (t) {
  t.plan(5)

  var store = new Store('test-db-ids', options)

  var localObj1 = {id: 'test1', foo: 'bar1'}
  var localObj2 = {id: 'test2', foo: 'bar2'}

  store.add([localObj1, localObj2])

  .then(function () {
    return store.findAllUnsynced({remote: 'test-db-ids-remote', keys: ''})
  })

  .then(function (changedDocs) {
    t.is(changedDocs.length, 2, 'local changes detected, 2 docs')
    t.ok(changedDocs[0].id, 'prop "id" exists')
    t.is(changedDocs[0].foo, 'bar1', 'changedDocs[0].foo matches')
    t.is(changedDocs[1].foo, 'bar2', 'changedDocs[1].foo matches')

    return store.sync()
  })

  .then(function () {
    return store.findAllUnsynced({remote: 'test-db-ids-remote', keys: ''})
  })

  .then(function (changedDocs) {
    t.is(changedDocs.length, 0, 'local changes synced with remote')
  })
})
