'use strict'

var test = require('tape')

var Store = require('../../')
var options = process.browser ? {
  adapter: 'memory'
} : {
  db: require('memdown')
}

test('has "sync" methods', function (t) {
  t.plan(6)

  var store = new Store('test-db-sync', options)

  t.is(typeof store.pull, 'function', 'had "pull" method')
  t.is(typeof store.push, 'function', 'had "push" method')
  t.is(typeof store.sync, 'function', 'had "sync" method')
  t.is(typeof store.connect, 'function', 'had "connect" method')
  t.is(typeof store.disconnect, 'function', 'had "disconnect" method')
  t.is(typeof store.isConnected, 'function', 'had "isConnected" method')
})

test('store.on("push") for store.push()', function (t) {
  t.plan(2)

  var store = new Store('test-db-push', options)
  var pushEvents = []

  store.on('push', pushEvents.push.bind(pushEvents))

  store.db.put({_id: 'test', foo: 'bar'})

  .then(function () {
    return store.push()
  })

  .then(function () {
    t.is(pushEvents.length, 1, 'triggers 1 push event')
    t.is(pushEvents[0].foo, 'bar', 'event passes object')
  })
})
