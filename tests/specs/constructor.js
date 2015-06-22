'use strict'

var test = require('tape')

var Store = require('../../')

test('constructs a store object', function (t) {
  t.plan(1)

  var store = new Store('test-db')

  t.is(typeof store, 'object', 'is object')
})

test('constructs a store object w/o new', function (t) {
  t.plan(1)

  var store = Store('test-db')

  t.is(typeof store, 'object', 'is object')
})

test('throws an error w/o db', function (t) {
  t.plan(1)

  t.throws(Store, 'no arguments')
})
