var simple = require('simple-mock')
var test = require('tape')
var init = require('../../lib/init')

test('is "reset" triggered on "signin"', function (t) {
  t.plan(5)

  var signInTestOrder = []
  var hoodie = {
    account: {
      on: simple.stub()
    },
    store: {
      clear: function () {
        t.pass('store.clear called on "signout"')
      },
      connect: function () {
        t.pass('store.connect is called on "signin"')
        signInTestOrder.push('connect')
      },
      reset: function () {
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
  t.is(hoodie.account.on.callCount, 2, 'calls hoodie account.on twice')

  var signOutHandler = hoodie.account.on.calls[0].args[1]
  signOutHandler()

  var signInHandler = hoodie.account.on.calls[1].args[1]
  signInHandler()

  t.deepEqual(signInTestOrder, ['reset', 'connect'], 'store.connect was called after store.reset')
})
