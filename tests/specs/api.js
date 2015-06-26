'use strict'

var test = require('tape')

var Store = require('../../')

test('has "api" methods', function (t) {
  t.plan(12)

  var store = new Store('test-db')

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

