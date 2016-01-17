var merge = require('lodash/merge')
var test = require('tape')

var Store = require('../../')
var PouchDB = global.PouchDB || require('pouchdb')
var options = process.browser ? {
  adapter: 'memory'
} : {
  db: require('memdown')
}

test('has "sync" methods', function (t) {
  t.plan(6)

  var store = new Store('test-db-sync', merge({remote: 'test-db-sync-remote'}, options))

  t.is(typeof store.pull, 'function', 'had "pull" method')
  t.is(typeof store.push, 'function', 'had "push" method')
  t.is(typeof store.sync, 'function', 'had "sync" method')
  t.is(typeof store.connect, 'function', 'had "connect" method')
  t.is(typeof store.disconnect, 'function', 'had "disconnect" method')
  t.is(typeof store.isConnected, 'function', 'had "isConnected" method')
})

test('store.push() returns hoodie objects', function (t) {
  t.plan(3)

  var store = new Store('test-db-push-return', merge({remote: 'test-db-push-return-remote'}, options))
  var obj1 = {id: 'test1', foo: 'bar1'}
  var obj2 = {id: 'test2', foo: 'bar2'}

  store.add([obj1, obj2])

  .then(function () {
    return store.push()
  })

  .then(function (pushedObjs) {
    t.is(pushedObjs.length, 2, '2 items returned')
    t.is(pushedObjs[0].id, 'test1', 'returns hoodie object')
    t.is(pushedObjs[1].foo, 'bar2', 'returns hoodie object')
  })

  .catch(t.fail)
})

test('store.push(docsOrIds) returns hoodie objects', function (t) {
  t.plan(3)

  var store = new Store('test-db-push-objects-return', merge({remote: 'test-db-push-objects-return-remote'}, options))
  var obj1 = {id: 'test1', foo: 'bar1'}
  var obj2 = {id: 'test2', foo: 'bar2'}

  store.add([obj1, obj2])

  .then(function (addedObjs) {
    return store.push(addedObjs)
  })

  .then(function (pushedObjs) {
    t.is(pushedObjs.length, 2, '2 items returned')
    t.is(pushedObjs[0].id, 'test1', 'returns hoodie object')
    t.is(pushedObjs[1].foo, 'bar2', 'returns hoodie object')
  })

  .catch(t.fail)
})

test('store.sync() returns hoodie objects', function (t) {
  t.plan(3)

  var store = new Store('test-db-sync-return', merge({remote: 'test-db-sync-return-remote'}, options))
  var obj1 = {id: 'test1', foo: 'bar1'}
  var obj2 = {id: 'test2', foo: 'bar2'}

  store.add([obj1, obj2])

  .then(function () {
    return store.sync()
  })

  .then(function (pushedObjs) {
    t.is(pushedObjs.length, 2, '2 items returned')
    t.is(pushedObjs[0].id, 'test1', 'returns hoodie object')
    t.is(pushedObjs[1].foo, 'bar2', 'returns hoodie object')
  })

  .catch(t.fail)
})

test('store.on("push") for store.push()', function (t) {
  t.plan(3)

  var store = new Store('test-db-push', merge({remote: 'test-db-push-remote'}, options))
  var pushEvents = []

  store.on('push', pushEvents.push.bind(pushEvents))

  store.add({id: 'test', foo: 'bar'})

  .then(function () {
    return store.push()
  })

  .then(function () {
    t.is(pushEvents.length, 1, 'triggers 1 push event')
    t.is(pushEvents[0].id, 'test', 'event passes object')
    t.is(pushEvents[0].foo, 'bar', 'event passes object')
  })

  .catch(t.fail)
})

test('api.off("push")', function (t) {
  t.plan(2)

  var store = new Store('test-db-push-off', merge({remote: 'test-db-push-off-remote'}, options))
  var pushEvents = []

  store.on('push', pushHandler)
  function pushHandler (doc) {
    pushEvents.push(doc)
  }

  var obj1 = {id: 'test1', foo1: 'bar1'}
  var obj2 = {id: 'test2', foo1: 'bar2'}

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

  .catch(t.fail)
})

test('api.one("push")', function (t) {
  t.plan(4)

  var store = new Store('test-db-push-one', merge({remote: 'test-db-push-one-remote'}, options))
  var pushEvents = []

  store.one('push', pushEvents.push.bind(pushEvents))

  var obj1 = {id: 'test1', foo: 'bar1'}
  var obj2 = {id: 'test2', foo: 'bar2'}

  store.add([obj1, obj2])

  .then(function () {
    return store.push()
  })

  .then(function () {
    t.is(pushEvents.length, 1, 'triggers 1 push event')
    t.is(pushEvents[0].id, 'test1', 'event passes object')
    t.is(pushEvents[0].foo, 'bar1', 'event passes object')
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

  var store = new Store('test-db-on-connect', merge({remote: 'test-db-on-connect-remote'}, options))
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
  t.plan(13)

  var store = new Store('test-db-remote-changes-local', merge({remote: 'test-db-remote-changes-remote'}, options))
  var remoteDb = new PouchDB('test-db-remote-changes-remote', options)

  var changeEvents = []
  var addEvents = []
  var updateEvents = []
  var removeEvents = []

  store.on('change', function (event, object, options) {
    changeEvents.push({
      event: event,
      object: object,
      options: options
    })
  })

  store.on('add', function (object, options) {
    addEvents.push({
      object: object,
      options: options
    })
  })

  store.on('update', function (object, options) {
    updateEvents.push({
      object: object,
      options: options
    })
  })

  store.on('remove', function (object, options) {
    removeEvents.push({
      object: object,
      options: options
    })
  })

  var doc = {_id: 'test', foo: 'bar'}
  remoteDb.put(doc)

  .then(function (response) {
    doc._rev = response.rev
    return store.pull()
  })

  .then(function () {
    doc.foo = 'baz'
    return remoteDb.put(doc)
  })

  .then(function (response) {
    doc._rev = response.rev
    return store.pull()
  })

  .then(function () {
    doc._deleted = true
    doc.foo = 'boo'
    return remoteDb.put(doc)
  })

  .then(function () {
    return store.pull()
  })

  .then(function () {
    t.is(changeEvents.length, 3, '"change" event triggered')
    t.is(changeEvents[0].event, 'add', '"change" triggered with event name')
    t.is(changeEvents[0].object.foo, 'bar', '"change" triggered with object')
    t.deepEqual(changeEvents[0].options, {remote: true}, '"change" triggered with {remote: true}')

    t.is(addEvents.length, 1, '"add" event triggered')
    t.is(addEvents[0].object.foo, 'bar', '"add" triggered with object')
    t.deepEqual(addEvents[0].options, {remote: true}, '"add" triggered with {remote: true}')

    t.is(updateEvents.length, 1, '"update" event triggered')
    t.is(updateEvents[0].object.foo, 'baz', '"update" triggered with object')
    t.deepEqual(updateEvents[0].options, {remote: true}, '"update" triggered with {remote: true}')

    t.is(removeEvents.length, 1, '"remove" event triggered')
    t.is(removeEvents[0].object.foo, 'boo', '"remove" triggered with object')
    t.deepEqual(removeEvents[0].options, {remote: true}, '"remove" triggered with {remote: true}')
  })

  .catch(t.fail)
})

test('triggers no "change" from remote if only local changes pushed', function (t) {
  t.plan(2)

  var store = new Store('test-db-remote-changes-local2', merge({remote: 'test-db-remote-changes-remote2'}, options))
  var remoteChangeEvents = []

  store.on('change', function (event, object, options) {
    if (!options || !options.remote) {
      return
    }
    remoteChangeEvents.push({
      event: event,
      object: object,
      options: options
    })
  })

  store.add({foo: 'bar'})

  .then(function () {
    return store.push()
  })

  .then(function () {
    t.is(remoteChangeEvents.length, 0, 'no "change" events triggered')
    return store.pull()
  })

  .then(function () {
    t.is(remoteChangeEvents.length, 0, 'no "change" events triggered')
  })

  .catch(t.fail)
})

test('after "clear", store.on("push") for store.push()', function (t) {
  t.plan(4)

  var store = new Store('test-db-push', merge({remote: 'test-db-push-remote'}, options))
  var pushEvents = []

  store.on('push', pushEvents.push.bind(pushEvents))
  store.on('clear', t.pass.bind(null, '"clear" event emitted'))

  store.reset()

  .then(function () {
    return store.add({id: 'test', foo: 'bar'})
  })

  .then(function () {
    return store.push()
  })

  .then(function () {
    t.is(pushEvents.length, 1, 'triggers 1 push event')
    t.is(pushEvents[0].id, 'test', 'event passes object')
    t.is(pushEvents[0].foo, 'bar', 'event passes object')
  })

  .catch(t.fail)
})
