'use strict'

var test = require('tape')
var waitFor = require('../utils/wait-for')

var Store = require('../../')
var options = process.browser ? {
  adapter: 'memory'
} : {
  db: require('memdown')
}

test('has "api" methods', function (t) {
  t.plan(12)

  var store = new Store('test-db-api', options)

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

  var store = new Store('test-db-change', options)
  var changeEvents = []

  store.on('change', addEventToArray.bind(null, changeEvents))

  store.add({
    foo: 'bar'
  })

  .then(waitFor(function () {
    return changeEvents.length
  }, 1))

  .then(function () {
    t.is(changeEvents.length, 1, 'triggers 1 change event')
    t.is(changeEvents[0].eventName, 'add', 'passes the event name')
    t.is(changeEvents[0].object.foo, 'bar', 'event passes object')
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

