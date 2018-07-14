var test = require('tape').test
var EventEmitter = require('events').EventEmitter

var withIdPrefix = require('../../lib/with-id-prefix')

test('withIdPrefix only adds itself to the parent EventEmitter if something is listening', function (t) {
  t.plan(13)

  var handlerCount = 0
  var handlerCallCount = 0
  var parentOnceWasCalled = false

  var state = {
    emitter: new EventEmitter()
  }
  var emitterOn = state.emitter.on
  var emitterOff = state.emitter.removeListener
  var emitterOne = state.emitter.once

  state.emitter.on = function (eventName, handler) {
    handlerCount += 1
    return emitterOn.call(state.emitter, eventName, handler)
  }
  state.emitter.removeListener = function (eventName, handler) {
    handlerCount -= 1
    return emitterOff.call(state.emitter, eventName, handler)
  }
  state.emitter.once = function (eventName, handler) {
    parentOnceWasCalled = true
    return emitterOne.call(state.emitter, eventName, function (arg) {
      var args = Array.prototype.slice.call(arguments)
      handler.apply(this, args)
    })
  }

  var prefixStore = withIdPrefix(state, 'test/')

  t.is(typeof prefixStore, 'object', 'prefixStore exists')

  t.is(handlerCount, 0, 'on creation of prefixStore no handler was added to the parent')

  var handler = function handler () {
    handlerCallCount += 1
  }

  prefixStore.on('change', handler)

  t.is(handlerCount, 1, 'prefixStore adds its handler to parent, if a handler is added to it')

  prefixStore.one('change', function handler2 () {
    handlerCallCount += 1
  })

  t.is(handlerCount, 1, 'prefixStore adds its handler only once')

  prefixStore.off('change', handler)

  t.is(handlerCount, 1, 'prefixStore only removes its handler if no handler is listening to it')

  state.emitter.emit('change', 'add', {_id: 'something'})

  t.is(handlerCallCount, 0, 'prefixStore filters events out')
  t.is(handlerCount, 1, "prefixStore doesn't remove its handler if an once handler is not called")

  state.emitter.emit('change', 'add', {_id: 'test/something'})

  t.is(handlerCallCount, 1, 'prefixStore emitts events with its prefix')
  t.is(handlerCount, 0, 'prefix removes its handler if no handler is listening')

  prefixStore.on('change', handler)

  t.is(handlerCount, 1, 'prefixStore adds its handler to parent, if a handler is added to it')

  prefixStore.off('change', handler)

  t.is(handlerCount, 0, 'prefix removes its handler if no handler is listening')

  prefixStore.on('hoodie_camp_fire_started', handler)

  t.is(handlerCount, 0, "prefix doesn't add its handler if a handler for an unknow event is added")

  t.is(parentOnceWasCalled, false, 'once on the parentEmitter was never called')
})
