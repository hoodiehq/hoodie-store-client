var merge = require('lodash.merge')
var test = require('tape')

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

