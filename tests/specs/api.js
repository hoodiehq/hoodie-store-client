var simple = require('simple-mock')
var test = require('tape')

var PouchDB = require('../utils/pouchdb.js')
var Store = require('../../')

test('API methods', function (t) {
  t.plan(12)

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
})

test('store.on("change") with adding one', function (t) {
  t.plan(3)

  var store = new Store('test-db-change', {
    PouchDB: PouchDB,
    remote: 'test-db-change'
  })
  var changeEvents = []

  store.on('change', addEventToArray.bind(null, changeEvents))

  store.add({
    foo: 'bar'
  })

  .then(function () {
    t.is(changeEvents.length, 1, 'triggers 1 change event')
    t.is(changeEvents[0].eventName, 'add', 'passes the event name')
    t.is(changeEvents[0].object.foo, 'bar', 'event passes object')
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
  t.plan(2)

  var store = new Store('test-db-one', {
    PouchDB: PouchDB,
    remote: 'test-db-one'
  })
  var addEvents = []

  store.one('add', addEventToArray.bind(null, addEvents))

  store.add({
    foo: 'bar'
  })

  .then(function () {
    t.is(addEvents.length, 1, 'triggers 1 add event')
    t.is(addEvents[0].object.foo, 'bar', 'event passes object')
  })

  .catch(t.fail)
})

test('store.reset creates empty instance of store', function (t) {
  t.plan(3)

  var store = new Store('test-db-clear', {
    PouchDB: PouchDB,
    remote: 'test-db-clear'
  })
  var addEvents = []
  store.on('add', addEvents.push.bind(addEvents))
  store.on('clear', t.pass.bind(null, '"clear" event emitted'))
  store.reset()

  .then(function () {
    return store.findAll()
  })

  .then(function (result) {
    t.deepEqual(result, [], '.findAll() resolves with empty array after .clear()')

    return store.add({id: 'test', foo: 'bar'})
  })

  .then(function () {
    t.is(addEvents.length, 1, 'triggers "add" event after "clear"')
  })

  .catch(t.fail)
})

test('store.reset creates empty instance of store with new options', function (t) {
  t.plan(3)

  var store = new Store('test-db-clear', {
    PouchDB: PouchDB,
    remote: 'test-db-clear'
  })
  var newOptions = {
    name: 'new-test-db-clear',
    remote: 'new-test-db-clear'
  }
  store.on('clear', t.pass.bind(null, '"clear" event emitted'))

  // merge in-memory adapter options
  store.reset(newOptions)

  .then(function () {
    return store.findAll()
  })

  .then(function (result) {
    t.deepEqual(result, [], '.findAll() resolves with empty array after .clear()')
    t.is(store.db.name, newOptions.name, 'reset store has a new name')
  })

  .catch(t.fail)
})

test('store.reset creates empty instance of store with new options passed as arguments', function (t) {
  t.plan(1)

  var reset = require('../../lib/reset')
  var clear = function () {
    return Promise.resolve()
  }

  var store = {
    disconnect: simple.stub().returnWith(Promise.resolve())
  }

  reset('new-test-db-clear-arguments', PouchDB, undefined, store, clear, undefined, 'new-test-db-clear-arguments-remote', {})

  .then(function () {
    t.is(store.db.name, 'new-test-db-clear-arguments', 'reset store has a new name')
  })

  .catch(t.error)
})

test('store.reset creates empty instance of store with new name and remoteBaseUrl', function (t) {
  t.plan(3)

  var CustomStore = Store.defaults({
    PouchDB: PouchDB,
    remoteBaseUrl: 'http://example.com/'
  })
  var store = new CustomStore('test-db-clear')
  var newOptions = {
    name: 'new-test-db-clear'
  }
  store.on('clear', t.pass.bind(null, '"clear" event emitted'))

  // merge in-memory adapter options
  store.reset(newOptions)

  .then(function () {
    return store.findAll()
  })

  .then(function (result) {
    t.deepEqual(result, [], '.findAll() resolves with empty array after .clear()')
    t.is(store.db.name, 'new-test-db-clear', 'reset store has a new name')
  })

  .catch(t.fail)
})

test('store.reset creates empty instance of store with new name', function (t) {
  t.plan(3)

  var store = new Store('test-db-clear', {
    PouchDB: PouchDB,
    remote: 'test-db-clear'
  })
  var newOptions = {
    name: 'new-test-db-clear'
  }
  store.on('clear', t.pass.bind(null, '"clear" event emitted'))

  // merge in-memory adapter options
  store.reset(newOptions)

  .then(function () {
    return store.findAll()
  })

  .then(function (result) {
    t.deepEqual(result, [], '.findAll() resolves with empty array after .clear()')
    t.is(store.db.name, 'new-test-db-clear', 'reset store has a new name')
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
