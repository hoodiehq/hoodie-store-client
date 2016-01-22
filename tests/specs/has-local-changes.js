var merge = require('lodash/merge')
var localStorageWrapper = require('humble-localstorage')
var test = require('tape')

var Store = require('../../')
var options = process.browser ? {
  adapter: 'memory'
} : {
  db: require('memdown')
}

test('.hasLocalChanges()', function (t) {
  t.plan(4)

  var store = new Store('test-db-local', merge({remote: 'test-db-local-remote'}, options))
  t.is(typeof store.hasLocalChanges, 'function', 'exsits')

  var localObj1 = {id: 'test1', foo: 'bar1'}
  var localObj2 = {id: 'test2', foo: 'bar2'}

  localStorageWrapper.clear()
  t.is(store.hasLocalChanges(), false, 'returns "false" by default')

  store.add([localObj1, localObj2])

  .then(function () {
    t.is(store.hasLocalChanges(), true, 'returns "true" after objects added')
    return store.sync()
  })

  .then(function () {
    t.is(store.hasLocalChanges(), false, 'returns "false" after sync')
  })

  .catch(t.fail)
})

test('.hasLocalChanges(filter)', function (t) {
  t.plan(3)

  var store = new Store('test-db-local-filter', merge({remote: 'test-db-local-filter-remote'}, options))

  var localObj1 = {id: 'test1', foo: 'bar1'}
  var localObj2 = {id: 'test2', foo: 'bar2'}

  store.add([localObj1, localObj2])

  .then(function () {
    t.is(store.hasLocalChanges('test1'), true, 'returns "true" with id filter')
    t.is(store.hasLocalChanges({id: 'test2'}), true, 'returns "true" to with object filter')

    return store.reset()
  })

  .then(function () {
    t.is(store.hasLocalChanges(), false, 'returns "false" after "clear"')
  })

  .catch(t.fail)
})

test('.hasLocalChanges() after changing same object twice', function (t) {
  t.plan(2)

  var store = new Store('test-db-reference', merge({remote: 'test-db-reference-remote'}, options))

  var localObj1 = {id: 'test1', foo: 'bar1'}

  store.add(localObj1)

  .then(store.update)

  .then(function () {
    var changedIds = localStorageWrapper.getObject('hoodie_changedObjectIds')
    t.is(store.hasLocalChanges('test1'), true, 'returns "true" to after update')
    t.is(changedIds.length, 1, 'stores only unique ids in reference')
  })

  .catch(t.fail)
})

test('.hasLocalChanges(unknownId)', function (t) {
  t.plan(2)

  var store = new Store('test-db-unmark', merge({remote: 'test-db-unmark-remote'}, options))

  var localObj = {_id: 'pouchdb-put-doc', foo: 'bar1'}

  store.db.put(localObj)

  .then(function () {
    t.is(store.hasLocalChanges('pouchdb-put-doc'), false, 'returns "false" to stored, but unreferenced object')
    t.is(store.hasLocalChanges('unknown-id'), false, 'returns "false" to unknown object')
  })

  .catch(t.fail)
})
