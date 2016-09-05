var merge = require('lodash/merge')
var simple = require('simple-mock')
var test = require('tape')
var PouchDB = global.PouchDB || require('pouchdb')

var Store = require('../../')
var options = process.browser ? {
  adapter: 'memory'
} : {
  db: require('memdown')
}

test('API methods', function (t) {
  t.plan(12)

  var store = new Store('test-db-api', merge({remote: 'test-db-api'}, options))

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

  var store = new Store('test-db-change', merge({remote: 'test-db-change'}, options))
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

  var store = new Store('test-db-off', merge({remote: 'test-db-off'}, options))
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

  var store = new Store('test-db-one', merge({remote: 'test-db-one'}, options))
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

  var store = new Store('test-db-clear', merge({remote: 'test-db-clear'}, options))
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
  t.plan(4)

  var store = new Store('test-db-clear', merge({remote: 'test-db-clear'}, options))
  var newOptions = {
    name: 'new-test-db-clear',
    remote: 'new-test-db-clear'
  }
  store.on('clear', t.pass.bind(null, '"clear" event emitted'))

  // merge in-memory adapter options
  store.reset(merge({}, options, newOptions))

  .then(function () {
    return store.findAll()
  })

  .then(function (result) {
    t.deepEqual(result, [], '.findAll() resolves with empty array after .clear()')
    t.is(store.db.name, newOptions.name, 'reset store has a new name')
    t.is(store.db.__opts.remote, newOptions.remote, 'reset store has a new remote')
  })

  .catch(t.fail)
})

test('store.reset creates empty instance of store with new options passed as arguments', function (t) {
  t.plan(1)

  var options = process.browser ? {
    adapter: 'memory'
  } : {
    db: require('memdown')
  }
  var CustomPouchDB = PouchDB.defaults(options)
  var reset = require('../../lib/reset')
  var clear = function () {
    return Promise.resolve()
  }

  var store = {
    disconnect: simple.stub().returnWith(Promise.resolve())
  }

  reset('new-test-db-clear-arguments', CustomPouchDB, undefined, store, clear, undefined, 'new-test-db-clear-arguments-remote', {}, PouchDB, options)

  .then(function () {
    t.is(store.db.name, 'new-test-db-clear-arguments', 'reset store has a new name')
  })

  .catch(t.error)
})

test('store.reset creates empty instance of store with new name and remoteBaseUrl', function (t) {
  t.plan(3)

  var CustomStore = Store.defaults({remoteBaseUrl: 'http://example.com/'})
  var store = new CustomStore('test-db-clear', options)
  var newOptions = {
    name: 'new-test-db-clear'
  }
  store.on('clear', t.pass.bind(null, '"clear" event emitted'))

  // merge in-memory adapter options
  store.reset(merge({}, options, newOptions))

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

  var store = new Store('test-db-clear', merge({remote: 'test-db-clear'}, options))
  var newOptions = {
    name: 'new-test-db-clear'
  }
  store.on('clear', t.pass.bind(null, '"clear" event emitted'))

  // merge in-memory adapter options
  store.reset(merge({}, options, newOptions))

  .then(function () {
    return store.findAll()
  })

  .then(function (result) {
    t.deepEqual(result, [], '.findAll() resolves with empty array after .clear()')
    t.is(store.db.name, 'new-test-db-clear', 'reset store has a new name')
  })

  .catch(t.fail)
})

test('store.reset creates empty instance of store with new remote name', function (t) {
  t.plan(4)

  var store = new Store('test-db-clear', merge({remote: 'test-db-clear'}, options))
  var newOptions = {
    remote: 'new-test-db-clear'
  }
  store.on('clear', t.pass.bind(null, '"clear" event emitted'))

  // merge in-memory adapter options
  store.reset(merge({}, options, newOptions))

  .then(function () {
    return store.findAll()
  })

  .then(function (result) {
    t.deepEqual(result, [], '.findAll() resolves with empty array after .clear()')
    t.is(store.db.name, 'test-db-clear', 'reset store has a new name')
    t.is(store.db.__opts.remote, newOptions.remote, 'reset store has a new remote')
  })

  .catch(t.fail)
})

test('ajax property of options should be removed', function (t) {
  t.plan(2)

  var opts = merge({remote: 'test-db-clear'}, options)
  opts.ajax = function () {}

  t.isNot(opts.ajax, undefined, 'ajax option is present')

  Store('test-db-clear', opts)

  t.is(opts.ajax, undefined, 'ajax option has been removed')
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
