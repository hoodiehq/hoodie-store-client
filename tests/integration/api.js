var test = require('tape')

var PouchDB = require('../utils/pouchdb.js')
var Store = require('../../')

test('API methods', function (t) {
  t.plan(13)

  var store = new Store('test-db-api', {
    PouchDB: PouchDB,
    remote: 'test-db-api'
  })

  t.is(typeof store.add, 'function', 'has "add" method')
  t.is(typeof store.find, 'function', 'has "find" method')
  t.is(typeof store.findOrAdd, 'function', 'has "findOrAdd" method')
  t.is(typeof store.findAll, 'function', 'has "findAll" method')
  t.is(typeof store.update, 'function', 'has "update" method')
  t.is(typeof store.updateOrAdd, 'function', 'has "updateOrAdd" method')
  t.is(typeof store.updateAll, 'function', 'has "updateAll" method')
  t.is(typeof store.remove, 'function', 'has "remove" method')
  t.is(typeof store.removeAll, 'function', 'has "removeAll" method')
  t.is(typeof store.on, 'function', 'has "on" method')
  t.is(typeof store.one, 'function', 'has "one" method')
  t.is(typeof store.off, 'function', 'has "off" method')
  t.is(typeof store.withIdPrefix, 'function', 'has "withIdPrefix" method')
})

test('store.on("change") with adding one', function (t) {
  t.plan(2)

  var store = new Store('test-db-change', {
    PouchDB: PouchDB,
    remote: 'test-db-change'
  })

  store.on('change', function (eventName, doc) {
    t.is(eventName, 'add', 'passes the event name')
    t.is(doc.foo, 'bar', 'event passes object')
  })

  store.add({
    foo: 'bar'
  })

  .catch(t.fail)
})

test('store.off("add") with one add handler', function (t) {
  t.plan(1)

  var store = new Store('test-db-off', {
    PouchDB: PouchDB,
    remote: 'test-db-off'
  })
  var addEvents = []
  var changeEvents = []

  var addHandler = function () {
    return addEventToArray.bind(null, addEvents)
  }

  store.on('add', addHandler)
  store.on('change', addEventToArray.bind(null, changeEvents))
  store.off('add', addHandler)

  store.add({
    foo: 'bar'
  })

  .then(function () {
    t.is(addEvents.length, 0, 'triggers no add event')
  })

  .catch(t.fail)
})

test('store.one("add") with adding one', function (t) {
  t.plan(1)

  var store = new Store('test-db-one', {
    PouchDB: PouchDB,
    remote: 'test-db-one'
  })

  store.one('add', function (doc) {
    t.is(doc.foo, 'bar', 'event passes object')
  })

  store.add({
    foo: 'bar'
  })

  .catch(t.fail)
})

test('store.reset creates empty instance of store', function (t) {
  t.plan(2)

  var store = new Store('test-db-clear', {
    PouchDB: PouchDB,
    remote: 'test-db-clear'
  })
  var clearTriggered = false
  store.on('add', function (doc) {
    t.ok(clearTriggered, 'triggers "add" event after "clear"')
  })
  store.on('clear', function () {
    clearTriggered = true
    t.pass('"clear" event emitted')
  })
  store.reset()

  .then(function () {
    return store.findAll()
  })

  .then(function (result) {
    t.deepEqual(result, [], '.findAll() resolves with empty array after .clear()')

    return store.add({id: 'test', foo: 'bar'})
  })

  .catch(t.fail)
})

function addEventToArray (array, object) {
  if (arguments.length > 2) {
    arguments[0].push({
      eventName: arguments[1],
      object: arguments[2]
    })
  } else {
    arguments[0].push({
      object: arguments[1]
    })
  }
}
