var merge = require('lodash.merge')
var test = require('tape')

var Store = require('../../')
var options = process.browser ? {
  adapter: 'memory'
} : {
  db: require('memdown')
}

test('.findAllUnsynced()', function (t) {
  t.plan(1)

  var store = new Store('test-db-find-all-unsynced-1', merge({remote: 'test-db-find-all-unsynced-1-remote'}, options))

  t.is(typeof store.findAllUnsynced, 'function', 'exists')
})

test('.findAllUnsynced() before & after sync', function (t) {
  t.plan(5)

  var store = new Store('test-db-find-all-unsynced-2', merge({remote: 'test-db-find-all-unsynced-2-remote'}, options))

  var localObj1 = {id: 'test1', foo: 'bar1'}
  var localObj2 = {id: 'test2', foo: 'bar2'}

  store.add([localObj1, localObj2])

  .then(function () {
    return store.findAllUnsynced()
  })

  .then(function (changedDocs) {
    t.is(changedDocs.length, 2, 'local changes detected, 2 docs')
    t.ok(changedDocs[0].id, 'prop "id" exists')
    t.is(changedDocs[0].foo, 'bar1', 'changedDocs[0].foo matches')
    t.is(changedDocs[1].foo, 'bar2', 'changedDocs[1].foo matches')

    return store.sync()
  })

  .then(function () {
    return store.findAllUnsynced()
  })

  .then(function (changedDocs) {
    t.is(changedDocs.length, 0, 'local changes synced with remote')
  })
})

test('.findAllUnsynced("id")', function (t) {
  t.plan(2)

  var store = new Store('test-db-find-all-unsynced-3', merge({remote: 'test-db-find-all-unsynced-3-remote'}, options))

  store.add([
    {id: 'id', foo: 'bar'},
    {id: 'otherid', foo: 'bar'}
  ])

  .then(function () {
    return store.findAllUnsynced('id')
  })

  .then(function (objects) {
    t.is(objects.length, 1, 'find object')
    t.is(objects[0].foo, 'bar', 'object.foo matches')
  })
})

test('.findAllUnsynced(["id1", {id: "id2"}])', function (t) {
  t.plan(2)

  var store = new Store('test-db-find-all-unsynced-3', merge({remote: 'test-db-find-all-unsynced-3-remote'}, options))

  store.add([
    {id: 'id1', foo: 'bar'},
    {id: 'id2', foo: 'bar'},
    {id: 'id3', foo: 'bar'}
  ])

  .then(function () {
    return store.findAllUnsynced(['id1', {id: 'id2'}])
  })

  .then(function (objects) {
    t.is(objects.length, 2, 'finds two objects')
    t.is(objects[0].foo, 'bar', 'objects properties passed')
  })
})
