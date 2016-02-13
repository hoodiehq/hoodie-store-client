var simple = require('simple-mock')
var test = require('tape')
var init = require('../../lib/init')

test('is "reset" triggered on "signin"', function (t) {
  t.plan(6)

  var signInTestOrder = []
  var hoodie = {
    account: {
      id: 0,
      on: simple.stub(),
      isSignedIn: simple.stub()
    },
    store: {
      connect: function () {
        t.pass('store.connect is called on "signin"')
        signInTestOrder.push('connect')
      },
      reset: function (options) {
        t.isNot(typeof options, 'undefined', 'store.reset options are defined')
        t.isNot(typeof options.name, 'undefined', 'store.reset options has defined name')
        t.pass('store.reset called on "signin"')
        signInTestOrder.push('reset')

        return {
          then: function (callback) {
            callback()
          }
        }
      }
    }
  }

  init(hoodie)
  t.is(hoodie.account.on.callCount, 2, 'calls hoodie account.on once')

  var signInHandler = hoodie.account.on.calls[1].args[1]
  signInHandler()

  t.deepEqual(signInTestOrder, ['reset', 'connect'], 'store.connect was called after store.reset')
})

test('is "reset" triggered on "signout"', function (t) {
  t.plan(4)

  var hoodie = {
    account: {
      id: 0,
      on: simple.stub(),
      isSignedIn: simple.stub()
    },
    store: {
      reset: function (options) {
        t.isNot(typeof options, 'undefined', 'store.reset options are defined')
        t.isNot(typeof options.name, 'undefined', 'store.reset options has defined name')
        t.pass('store.reset called on "signout"')
      }
    }
  }

  init(hoodie)
  t.is(hoodie.account.on.callCount, 2, 'calls hoodie account.on once')

  var signOutHandler = hoodie.account.on.calls[0].args[1]
  signOutHandler()
})

test('"hoodie.store.connect()" is called when "hoodie.account.isSignedIn()" returns "true" ', function (t) {
  t.plan(1)

  var hoodie = {
    account: {
      id: 0,
      on: simple.stub(),
      isSignedIn: simple.stub().returnWith(true)
    },
    store: {
      connect: simple.stub(),
      reset: simple.stub()
    }
  }

  init(hoodie)
  t.is(hoodie.store.connect.callCount, 1,
       'calls hoodie account.connect once')
})

test('"hoodie.store.connect()" is *not* called when "hoodie.account.isSignedIn()" returns "false"', function (t) {
  t.plan(1)

  var hoodie = {
    account: {
      id: 0,
      on: simple.stub(),
      isSignedIn: simple.stub().returnWith(false)
    },
    store: {
      connect: simple.stub(),
      reset: simple.stub()
    }
  }

  init(hoodie)
  t.is(hoodie.store.connect.callCount, 0,
       'does not hoodie account.connect')
})

