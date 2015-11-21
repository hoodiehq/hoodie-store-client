var test = require('tape')
var Hoodie = require('../../index')

test('has "on" method', function (t) {
  t.plan(1)

  var hoodie = new Hoodie()
  t.is(typeof hoodie.on, 'function', 'has method')
})

test('has "one" method', function (t) {
  t.plan(1)

  var hoodie = new Hoodie()
  t.is(typeof hoodie.one, 'function', 'has method')
})

test('has "off" method', function (t) {
  t.plan(1)

  var hoodie = new Hoodie()
  t.is(typeof hoodie.off, 'function', 'has method')
})

test('has "trigger" method', function (t) {
  t.plan(1)

  var hoodie = new Hoodie()
  t.is(typeof hoodie.trigger, 'function', 'has method')
})
