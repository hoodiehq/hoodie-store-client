var localStorageWrapper = require('humble-localstorage')
var test = require('tape')

var subscribeToInternalEvents = require('../../lib/subscribe-to-internal-events')
var EventEmitter = require('events').EventEmitter

test('.subscribeToInternalEvents() can handle resetted store', function (t) {
  t.plan(1)

  var emitter = new EventEmitter()
  subscribeToInternalEvents(emitter)
  localStorageWrapper.setObject('hoodie_changedObjectIds', ['someid'])
  emitter.emit('clear')
  emitter.emit('push')
  t.is(localStorageWrapper.getObject('hoodie_changedObjectIds'), null, 'local storage for subscribeToInternalEvents is not modified')
})
