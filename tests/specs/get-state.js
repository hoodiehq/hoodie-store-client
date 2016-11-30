var test = require('tape')

var getState = require('../../lib/get-state')

test('getState preserves "account" property', function (t) {
  t.plan(2)

  var options = {
    url: 'http://localhost:1234/hoodie',
    account: {
      id: 'id1'
    }
  }

  var state = getState(options)

  t.is(typeof state.account, 'object', 'account object is preserved')
  t.is(state.account.id, 'id1', 'account id is preserved')
})

test('getState without "url" option', function (t) {
  t.plan(1)

  t.throws(function () {
    getState()
  }, /"url" option is not defined/, 'throws exception when "url" option is not defined')
})
