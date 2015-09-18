var test = require('tape')
var Hoodie = require('../../index')

test('has "id" method', function (t) {
  t.plan(1)

  var hoodie = new Hoodie()
  t.is(typeof hoodie.id, 'function', 'has method')
})
