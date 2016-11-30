var test = require('tape')
var Hoodie = require('../../index')

test('has "on" method', function (t) {
  t.plan(1)

  var hoodie = new Hoodie({url: 'http://localhost:1234/hoodie'})
  t.is(typeof hoodie.on, 'function', 'has method')
})

test('"on" without listener', function (t) {
  t.plan(1)

  var hoodie = new Hoodie({url: 'http://localhost:1234/hoodie'})
  t.throws(function () {
    hoodie.on('account:signin')
  }, /must be a function/, 'throws exception when listener is not a function')
})

test('"on" returns an object', function (t) {
  t.plan(1)

  var hoodie = new Hoodie({url: 'http://localhost:1234/hoodie'})
  t.is(typeof hoodie.on('account:signin', function () {}), 'object', 'returns an object')
})

test('has "one" method', function (t) {
  t.plan(1)

  var hoodie = new Hoodie({url: 'http://localhost:1234/hoodie'})
  t.is(typeof hoodie.one, 'function', 'has method')
})

test('"one" returns an object', function (t) {
  t.plan(1)

  var hoodie = new Hoodie({url: 'http://localhost:1234/hoodie'})
  t.is(typeof hoodie.one('account:signin', function () {}), 'object', 'returns an object')
})

test('"one" without listener', function (t) {
  t.plan(1)

  var hoodie = new Hoodie({url: 'http://localhost:1234/hoodie'})
  t.throws(function () {
    hoodie.one('account:signin')
  }, /must be a function/, 'throws exception when listener is not a function')
})

test('has "off" method', function (t) {
  t.plan(1)

  var hoodie = new Hoodie({url: 'http://localhost:1234/hoodie'})
  t.is(typeof hoodie.off, 'function', 'has method')
})

test('"off" returns an object', function (t) {
  t.plan(1)

  var hoodie = new Hoodie({url: 'http://localhost:1234/hoodie'})
  t.is(typeof hoodie.off('account:signin', function () {}), 'object', 'returns an object')
})

test('"off" without listener', function (t) {
  t.plan(1)

  var hoodie = new Hoodie({url: 'http://localhost:1234/hoodie'})
  t.throws(function () {
    hoodie.off('account:signin')
  }, /must be a function/, 'throws exception when listener is not a function')
})

test('has "trigger" method', function (t) {
  t.plan(1)

  var hoodie = new Hoodie({url: 'http://localhost:1234/hoodie'})
  t.is(typeof hoodie.trigger, 'function', 'has method')
})

test('"trigger" returns an object', function (t) {
  t.plan(1)

  var hoodie = new Hoodie({url: 'http://localhost:1234/hoodie'})
  t.is(typeof hoodie.trigger('account:signin'), 'object', 'returns an object')
})
