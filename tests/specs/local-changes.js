'use strict'

var test = require('tape')
var localStorageWrapper = require('humble-localstorage')

var Store = require('../../')
var options = process.browser ? {
  adapter: 'memory'
} : {
  db: require('memdown')
}

test('has "local-changes" method', function (t) {
  t.plan(1)

  var store = new Store('test-db-local-changes', options)

  t.is(typeof store.hasLocalChanges, 'function', 'has "hasLocalChanges" method')
})

test('returns correct response to local changes', function (t) {
  t.plan(3)

  var store = new Store('test-db-local', options)

  var localObj1 = {id: 'test1', foo: 'bar1'}
  var localObj2 = {id: 'test2', foo: 'bar2'}

  localStorageWrapper.removeItem('hoodie_changedObjectIds')
  t.is(store.hasLocalChanges(), false, 'returns "false" after removing reference array')

  store.add([localObj1, localObj2])

  .then(function () {
    t.is(store.hasLocalChanges(), true, 'returns "true" to local changes')

    store.sync()

    .then(function () {
      t.is(store.hasLocalChanges(), false, 'returns "false" after synced changes')
    })
  })
})

test('returns correct response to local changes with filter', function (t) {
  t.plan(3)

  var store = new Store('test-db-local-filter', options)

  var localObj1 = {id: 'test1', foo: 'bar1'}
  var localObj2 = {id: 'test2', foo: 'bar2'}

  store.add([localObj1, localObj2])

  .then(function () {
    t.is(store.hasLocalChanges('test1'), true, 'returns "true" to local change with id')
    t.is(store.hasLocalChanges({id: 'test2'}), true, 'returns "true" to local changes with object')

    store.clear()

    .then(function () {
      t.is(store.hasLocalChanges(), false, 'returns "false" after "clear" event')
    })
  })
})

test('correctly store unique ids in reference', function (t) {
  t.plan(2)

  var store = new Store('test-db-reference', options)

  var localObj1 = {id: 'test1', foo: 'bar1'}

  store.add(localObj1)

  .then(store.update)

  .then(function () {
    var changedIds = localStorageWrapper.getObject('hoodie_changedObjectIds')
    t.is(store.hasLocalChanges('test1'), true, 'returns "true" to localChanges after update')
    t.is(changedIds.length, 1, 'stores only unique ids in reference')
  })
})

test('unmarks only referenced ids after push', function (t) {
  t.plan(2)

  var store = new Store('test-db-unmark', options)

  var localObj1 = {id: 'test1', foo: 'bar1'}
  var localObj2 = {_id: 'test2', foo: 'bar2'}

  store.add(localObj1)

  .then(function () {
    return store.db.put(localObj2)
  })

  .then(function () {
    t.is(store.hasLocalChanges('test2'), false, 'returns "false" to unreferenced, stored item')

    return store.sync()
  })

  .then(function () {
    t.is(store.hasLocalChanges(), false, 'returns "false" after sync')

    store.clear()
  })
})
