var test = require('tape')

var getState = require('../../lib/get-state')

test('getState preserves "account" property', function (t) {
  t.plan(2)

  var options = {
    account: {
      id: 'id1'
    }
  }

  var state = getState(options)

  t.is(typeof state.account, 'object', 'account object is preserved')
  t.is(state.account.id, 'id1', 'account id is preserved')
})
