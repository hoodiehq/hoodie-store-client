var simple = require('simple-mock')
var test = require('tape')

var disconnect = require('../../lib/disconnect')

test('disconnect() w/o active replication', function (t) {
  t.plan(1)

  var state = {}

  disconnect(state, 'newdb')

  .then(function () {
    t.is(arguments[0], undefined, 'resolves without argument')
  })
})

test('disconnect() with replication', function (t) {
  t.plan(4)

  var cancelReplication = simple.stub()
  var state = {
    replication: {
      cancel: cancelReplication
    },
    emitter: {
      emit: simple.stub()
    }
  }

  disconnect(state, 'newdb')

  .then(function () {
    t.is(cancelReplication.callCount, 1, 'cancels replication')
    t.is(state.replication, undefined, 'unsets replication')
    t.is(state.emitter.emit.callCount, 1, 'emits one event')
    t.is(state.emitter.emit.lastCall.arg, 'disconnect', 'emits "disconnect" event')
  })
})
