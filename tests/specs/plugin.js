var test = require('tape')
var Hoodie = require('../../index')

test('has "plugin" method', function (t) {
  t.plan(1)

  var hoodie = new Hoodie({url: 'http://localhost:1234/hoodie'})
  t.is(typeof hoodie.plugin, 'function', 'has method')
})

test('can define a plugin as a function', function (t) {
  t.plan(2)

  var hoodie = new Hoodie({url: 'http://localhost:1234/hoodie'})
  var sayHiPlugin = function (hoodie) {
    hoodie.sayHi = function () {
      return 'hi'
    }
  }
  hoodie.plugin(sayHiPlugin)

  t.is(typeof hoodie.sayHi, 'function', 'plugin is defined')
  t.is(hoodie.sayHi(), 'hi', 'plugin returns expected result')
})

test('can chain plugins calls', function (t) {
  t.plan(4)

  var hoodie = new Hoodie({url: 'http://localhost:1234/hoodie'})
  var sayHiPlugin = function (hoodie) {
    hoodie.sayHi = function () {
      return 'hi'
    }
  }
  var otherPlugin = function (hoodie) {
    hoodie.otherPlugin = function () {
      return 'the other one'
    }
  }

  hoodie
    .plugin(sayHiPlugin)
    .plugin(otherPlugin)

  t.is(typeof hoodie.sayHi, 'function', 'first plugin is defined')
  t.is(typeof hoodie.otherPlugin, 'function', 'second plugin is defined')
  t.is(hoodie.sayHi(), 'hi', 'first plugin returns expected result')
  t.is(hoodie.otherPlugin(), 'the other one', 'first plugin returns expected result')
})

test('can define a plugin as an object', function (t) {
  t.plan(4)

  var hoodie = new Hoodie({url: 'http://localhost:1234/hoodie'})
  var sayHiPlugin = {
    sayHi: function () {
      return 'hi'
    }
  }
  var otherPlugin = {
    otherPlugin: function () {
      return 'the other one'
    }
  }

  hoodie
    .plugin(sayHiPlugin)
    .plugin(otherPlugin)

  t.is(typeof hoodie.sayHi, 'function', 'first plugin is defined')
  t.is(typeof hoodie.otherPlugin, 'function', 'second plugin is defined')
  t.is(hoodie.sayHi(), 'hi', 'first plugin returns expected result')
  t.is(hoodie.otherPlugin(), 'the other one', 'first plugin returns expected result')
})
